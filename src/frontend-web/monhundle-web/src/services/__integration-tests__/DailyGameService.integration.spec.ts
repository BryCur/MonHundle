import { beforeEach, describe, expect, it } from 'vitest'
import { HttpResponse, http } from 'msw'
import { createPinia, setActivePinia } from 'pinia'
import { server } from '@/mocks/vitest.setup'
import { DailyGameApi } from '@/services/ApiService/DailyGameApi'
import { DailyGameService } from '@/services/GameService'
import { useGameStore } from '@/stores/GameStore'
import GameStatus from '@/domain/GameStatus'
import { GameModes } from '@/domain/enums/GameModes'
import { GameStates } from '@/domain/enums/GameStates'
import { DailyGameAlreadyExistsError } from '@/domain/errors/DailyGameAlreadyExistsError'
import { CookieKeys, deleteCookie, getCookie } from '@/services/CookieService'
import { clearStoredUserId, setStoredUserId } from '@/services/LocalStorageService'
import type { GuessResponse } from '@/domain/generated/response/objects/GuessResponse'
import type { MakeGuessBody } from '@/domain/generated/request-params/MakeGuessBody'


describe('DailyGameService — starting a game (integration)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    clearStoredUserId()
    deleteCookie(CookieKeys.CURRENT_DAILY_GAME)
  })

  it('sends a well-formed request to start a game: POST, no body', async () => {
    let capturedMethod: string | null = null
    let capturedBody: string | null = null
    server.use(
      http.post('*/game/daily/start', async ({ request }) => {
        capturedMethod = request.method
        capturedBody = await request.text()
        return HttpResponse.json('daily-game-id')
      }),
    )

    await new DailyGameService(new DailyGameApi(), useGameStore()).startNewGame()

    expect(capturedMethod).toBe('POST')
    expect(capturedBody).toBe('')
  })

  it('starts a new game end-to-end: real fetch call, store updated, cookie persisted', async () => {
    const gameId = await new DailyGameService(new DailyGameApi(), useGameStore()).startNewGame()

    // "mocked-daily-game-id" comes from the default handler in src/mocks/handlers.ts.
    expect(gameId).toBe('mocked-daily-game-id')
    expect(useGameStore().game).toMatchObject({ gameId: 'mocked-daily-game-id', gameMode: GameModes.Daily })
    expect(getCookie(CookieKeys.CURRENT_DAILY_GAME)).toBe('mocked-daily-game-id')
  })

  it('sends the stored user id as a Bearer token on the real request', async () => {
    setStoredUserId('player-42')

    let receivedAuthHeader: string | null = null
    server.use(
      http.post('*/game/daily/start', ({ request }) => {
        receivedAuthHeader = request.headers.get('Authorization')
        return HttpResponse.json('another-game-id')
      }),
    )

    await new DailyGameService(new DailyGameApi(), useGameStore()).startNewGame()

    expect(receivedAuthHeader).toBe('Bearer player-42')
  })

  it('propagates a non-409 backend error instead of silently creating a game', async () => {
    server.use(http.post('*/game/daily/start', () => new HttpResponse(null, { status: 500 })))

    const gameService = new DailyGameService(new DailyGameApi(), useGameStore())

    // Unlike UnlimitedGameApi.newGame(), DailyGameApi.newGame() does check `response.ok`
    // and throws a clean Error on a non-409 failure rather than choking on `.json()`.
    await expect(gameService.startNewGame()).rejects.toThrow(/unexpected error/)
    expect(useGameStore().game).toBeNull()
  })
})

describe('DailyGameService — making a guess (integration)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useGameStore().setGame(new GameStatus('g1', GameModes.Daily))
  })

  it('sends a well-formed guess request body', async () => {
    let capturedBody: MakeGuessBody | null = null
    server.use(
      http.post('*/game/daily/guess', async ({ request }) => {
        capturedBody = (await request.json()) as MakeGuessBody
        const response: GuessResponse = { monsterCode: 'nargacuga', gameStateAfterGuess: 0 }
        return HttpResponse.json(response)
      }),
    )

    await new DailyGameService(new DailyGameApi(), useGameStore()).makeGuess('gid-99', 'nargacuga')

    expect(capturedBody).toEqual({ gameId: 'gid-99', guessId: 'nargacuga' } satisfies MakeGuessBody)
  })

  it('sends the guess and records the result in the store (default handler)', async () => {
    await new DailyGameService(new DailyGameApi(), useGameStore()).makeGuess('g1', 'rathalos')

    const gameStore = useGameStore()
    expect(gameStore.game?.guesses).toHaveLength(1)
    expect(gameStore.game?.guesses[0]).toMatchObject({ monsterCode: 'rathalos' })
    expect(gameStore.game?.state).toBe(GameStates.Ongoing)
  })

  it('propagates a Win state from the response to the store', async () => {
    server.use(
      http.post('*/game/daily/guess', () => {
        const response: GuessResponse = { monsterCode: 'rathalos', gameStateAfterGuess: 1 } // GameStates.Win
        return HttpResponse.json(response)
      }),
    )

    await new DailyGameService(new DailyGameApi(), useGameStore()).makeGuess('g1', 'rathalos')

    expect(useGameStore().game?.state).toBe(GameStates.Win)
  })

  it('propagates a backend error instead of silently recording a guess', async () => {
    server.use(http.post('*/game/daily/guess', () => new HttpResponse(null, { status: 400 })))

    const gameService = new DailyGameService(new DailyGameApi(), useGameStore())

    await expect(gameService.makeGuess('g1', 'rathalos')).rejects.toThrow()
    expect(useGameStore().game?.guesses).toHaveLength(0)
  })
})

describe('DailyGameService — resuming a game (integration)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    deleteCookie(CookieKeys.CURRENT_DAILY_GAME)
  })

  it('requests the correct game id and method in the URL', async () => {
    let capturedMethod: string | null = null
    let capturedGameId: string | undefined
    server.use(
      http.get('*/game/daily/resume/:gameId', ({ request, params }) => {
        capturedMethod = request.method
        capturedGameId = params.gameId as string
        return HttpResponse.json({ gameId: 'gid-77', state: 0, guesses: [], gameMode: 1 })
      }),
    )

    await new DailyGameService(new DailyGameApi(), useGameStore()).resumeGame('gid-77')

    expect(capturedMethod).toBe('GET')
    expect(capturedGameId).toBe('gid-77')
  })

  it('resumes an ongoing game and reflects it in the store (default handler)', async () => {
    const isOngoing = await new DailyGameService(new DailyGameApi(), useGameStore()).resumeGame('g1')

    expect(isOngoing).toBe(true)
    expect(useGameStore().game).toMatchObject({ gameId: 'g1', gameMode: GameModes.Daily })
    expect(getCookie(CookieKeys.CURRENT_DAILY_GAME)).toBe('g1')
  })

  it('persists an already-finished game, and reports it as resumed', async () => {
    server.use(
      http.get('*/game/daily/resume/:gameId', () => {
        return HttpResponse.json({ gameId: 'g1', state: 1, guesses: [], gameMode: 1 }) // Win, Daily
      }),
    )

    const isGameSet = await new DailyGameService(new DailyGameApi(), useGameStore()).resumeGame('g1')

    expect(isGameSet).toBe(true)
    expect(useGameStore().game?.state).toBe(GameStates.Win)
  })

  it('returns false and leaves the store empty when the backend has no matching game', async () => {
    server.use(http.get('*/game/daily/resume/:gameId', () => new HttpResponse(null, { status: 404 })))

    const gameService = new DailyGameService(new DailyGameApi(), useGameStore())

    // DailyGameApi.resumeGame() does check `response.ok` before parsing — verified here
    // for this class specifically. A 404 with an empty body resolves to `null` cleanly.
    const isGameSet = await gameService.resumeGame('g1')

    expect(isGameSet).toBe(false)
    expect(useGameStore().isGameNull()).toBe(true)
    expect(getCookie(CookieKeys.CURRENT_DAILY_GAME)).toBeUndefined()
  })
})
