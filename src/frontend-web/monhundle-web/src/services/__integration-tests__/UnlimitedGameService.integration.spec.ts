import { beforeEach, describe, expect, it } from 'vitest'
import { HttpResponse, http } from 'msw'
import { createPinia, setActivePinia } from 'pinia'
import { server } from '@/mocks/vitest.setup'
import { UnlimitedGameApi } from '@/services/ApiService/UnlimitedGameApi'
import { UnlimitedGameService } from '@/services/GameService'
import { useGameStore } from '@/stores/GameStore'
import GameStatus from '@/domain/GameStatus'
import { GameModes } from '@/domain/enums/GameModes'
import { GameStates } from '@/domain/enums/GameStates'
import { CookieKeys, deleteCookie, getCookie } from '@/services/CookieService'
import { clearStoredUserId, setStoredUserId } from '@/services/LocalStorageService'
import type { GuessResponse } from '@/domain/generated/response/objects/GuessResponse'
import type { GameStateResponse } from '@/domain/generated/response/objects/GameStateResponse'
import type { MakeGuessBody } from '@/domain/generated/request-params/MakeGuessBody'

// Test the whole code chaine from the service layer with only network calls (fetch) faked.
describe('UnlimitedGameService — starting a game (integration)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    clearStoredUserId()
    deleteCookie(CookieKeys.CURRENT_UNLIMITED_GAME)
  })

  it('starts a new game end-to-end: real fetch call, store updated, cookie persisted', async () => {
    server.use(http.post('*/game/unlimited/start', () => HttpResponse.json('mocked-unlimited-game-id')))

    const gameService = new UnlimitedGameService(new UnlimitedGameApi(), useGameStore())

    const gameId = await gameService.startNewGame()

    expect(gameId).toBe('mocked-unlimited-game-id')

    const gameStore = useGameStore()
    expect(gameStore.game).toMatchObject({
      gameId: 'mocked-unlimited-game-id',
      gameMode: GameModes.Unlimited,
    })

    expect(getCookie(CookieKeys.CURRENT_UNLIMITED_GAME)).toBe('mocked-unlimited-game-id')
  })

  it('sends a well-formed request to start a game: POST, no body', async () => {
    let capturedMethod: string | null = null
    let capturedBody: string | null = null
    server.use(
      http.post('*/game/unlimited/start', async ({ request }) => {
        capturedMethod = request.method
        capturedBody = await request.text()
        return HttpResponse.json('game-id')
      }),
    )

    await new UnlimitedGameService(new UnlimitedGameApi(), useGameStore()).startNewGame()

    expect(capturedMethod).toBe('POST')
    expect(capturedBody).toBe('')
  })

  it('sends the stored user id as a Bearer token on the real request', async () => {
    setStoredUserId('player-42')

    let receivedAuthHeader: string | null = null
    server.use(
      http.post('*/game/unlimited/start', ({ request }) => {
        receivedAuthHeader = request.headers.get('Authorization')
        return HttpResponse.json('another-game-id')
      }),
    )

    await new UnlimitedGameService(new UnlimitedGameApi(), useGameStore()).startNewGame()

    expect(receivedAuthHeader).toBe('Bearer player-42')
  })

  it('propagates a backend error instead of silently creating a game', async () => {
    server.use(http.post('*/game/unlimited/start', () => new HttpResponse(null, { status: 500 })))

    const gameService = new UnlimitedGameService(new UnlimitedGameApi(), useGameStore())

    await expect(gameService.startNewGame()).rejects.toThrow()
    expect(useGameStore().game).toBeNull()
  })
})

describe('UnlimitedGameService — making a guess (integration)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // makeGuess() only ever mutates an existing game (addGuess/setState) — it never creates one
    useGameStore().setGame(new GameStatus('g1', GameModes.Unlimited))
  })

  it('sends a well-formed guess request body', async () => {
    let capturedBody: MakeGuessBody | null = null
    server.use(
      http.post('*/game/unlimited/guess', async ({ request }) => {
        capturedBody = (await request.json()) as MakeGuessBody
        const response: GuessResponse = { monsterCode: 'nargacuga', gameStateAfterGuess: 0 }
        return HttpResponse.json(response)
      }),
    )

    await new UnlimitedGameService(new UnlimitedGameApi(), useGameStore()).makeGuess('gid-99', 'nargacuga')

    expect(capturedBody).toEqual({ gameId: 'gid-99', guessId: 'nargacuga' } satisfies MakeGuessBody)
  })

  it('sends the guess and records the result in the store', async () => {
    server.use(
      http.post('*/game/unlimited/guess', () => {
        const response: GuessResponse = { monsterCode: 'rathalos', gameStateAfterGuess: 0 } // GameStates.Ongoing
        return HttpResponse.json(response)
      }),
    )

    const gameService = new UnlimitedGameService(new UnlimitedGameApi(), useGameStore())

    await gameService.makeGuess('g1', 'rathalos')

    const gameStore = useGameStore()
    expect(gameStore.game?.guesses).toHaveLength(1)
    expect(gameStore.game?.guesses[0]).toMatchObject({ monsterCode: 'rathalos' })
    expect(gameStore.game?.state).toBe(GameStates.Ongoing)
  })

  it('propagates a Win state from the response to the store', async () => {
    server.use(
      http.post('*/game/unlimited/guess', () => {
        const response: GuessResponse = { monsterCode: 'rathalos', gameStateAfterGuess: 1 } // GameStates.Win
        return HttpResponse.json(response)
      }),
    )

    await new UnlimitedGameService(new UnlimitedGameApi(), useGameStore()).makeGuess('g1', 'rathalos')

    expect(useGameStore().game?.state).toBe(GameStates.Win)
  })

  it('propagates a backend error instead of silently recording a guess', async () => {
    server.use(http.post('*/game/unlimited/guess', () => new HttpResponse(null, { status: 400 })))

    const gameService = new UnlimitedGameService(new UnlimitedGameApi(), useGameStore())

    await expect(gameService.makeGuess('g1', 'rathalos')).rejects.toThrow()
    expect(useGameStore().game?.guesses).toHaveLength(0)
  })
})

describe('UnlimitedGameService — resuming a game (integration)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    deleteCookie(CookieKeys.CURRENT_UNLIMITED_GAME)
  })

  it('requests the correct game id and method in the URL', async () => {
    let capturedMethod: string | null = null
    let capturedGameId: string | undefined
    server.use(
      http.get('*/game/unlimited/resume/:gameId', ({ request, params }) => {
        capturedMethod = request.method
        capturedGameId = params.gameId as string
        const response: GameStateResponse = { gameId: 'gid-77', state: 0, guesses: [], gameMode: 0 }
        return HttpResponse.json(response)
      }),
    )

    await new UnlimitedGameService(new UnlimitedGameApi(), useGameStore()).resumeGame('gid-77')

    expect(capturedMethod).toBe('GET')
    expect(capturedGameId).toBe('gid-77')
  })

  it('resumes an ongoing game and reflects it in the store', async () => {
    server.use(
      http.get('*/game/unlimited/resume/:gameId', ({ params }) => {
        const response: GameStateResponse = {
          gameId: params.gameId as string,
          state: 0, // GameStates.Ongoing
          guesses: [],
          gameMode: 0, // GameModes.Unlimited
        }
        return HttpResponse.json(response)
      }),
    )

    const gameService = new UnlimitedGameService(new UnlimitedGameApi(), useGameStore())

    const isOngoing = await gameService.resumeGame('g1')

    expect(isOngoing).toBe(true)
    expect(useGameStore().game).toMatchObject({ gameId: 'g1', gameMode: GameModes.Unlimited })
    expect(getCookie(CookieKeys.CURRENT_UNLIMITED_GAME)).toBe('g1')
  })

  it('returns false but still persists an already-finished game', async () => {
    server.use(
      http.get('*/game/unlimited/resume/:gameId', () => {
        const response: GameStateResponse = { gameId: 'g1', state: 1, guesses: [], gameMode: 0 } // Win, Unlimited
        return HttpResponse.json(response)
      }),
    )

    const isOngoing = await new UnlimitedGameService(new UnlimitedGameApi(), useGameStore()).resumeGame('g1')

    expect(isOngoing).toBe(false)
    expect(useGameStore().game?.state).toBe(GameStates.Win)
  })

  it('returns false and leaves the store empty when the backend has no matching game', async () => {
    server.use(http.get('*/game/unlimited/resume/:gameId', () => new HttpResponse(null, { status: 404 })))

    const gameService = new UnlimitedGameService(new UnlimitedGameApi(), useGameStore())

    const isOngoing = await gameService.resumeGame('g1')

    expect(isOngoing).toBe(false)
    expect(useGameStore().isGameNull()).toBe(true)
    expect(getCookie(CookieKeys.CURRENT_UNLIMITED_GAME)).toBeUndefined()
  })
})
