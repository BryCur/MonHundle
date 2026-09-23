import { beforeEach, describe, expect, it } from 'vitest'
import { HttpResponse, http } from 'msw'
import { createPinia, setActivePinia } from 'pinia'
import { server } from '@test-utils/vitest/setup'
import {
  BEARER_TOKEN_USER_ID,
  EXISTING_GAME_ID,
  MOCK_DAILY_START_GAME_ID,
  MONSTER_CODE_NARGACUGA,
  MONSTER_CODE_RATHALOS,
  SHAPE_TEST_GAME_ID,
  buildGameStateResponse,
  buildGuessResponse,
} from '@test-utils/vitest/fixtures'
import { DailyGameApi } from '@/services/ApiService/DailyGameApi'
import { DailyGameService } from '@/services/GameService'
import { useGameStore } from '@/stores/GameStore'
import GameStatus from '@/domain/GameStatus'
import { GameModes } from '@/domain/enums/GameModes'
import { GameStates } from '@/domain/enums/GameStates'
import { CookieKeys, deleteCookie, getCookie } from '@/services/CookieService'
import { clearStoredUserId, setStoredUserId } from '@/services/LocalStorageService'
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
        return HttpResponse.json(MOCK_DAILY_START_GAME_ID)
      }),
    )

    await new DailyGameService(new DailyGameApi(), useGameStore()).startNewGame()

    expect(capturedMethod).toBe('POST')
    expect(capturedBody).toBe('')
  })

  it('starts a new game end-to-end: real fetch call, store updated, cookie persisted', async () => {
    server.use(http.post('*/game/daily/start', () => HttpResponse.json(MOCK_DAILY_START_GAME_ID)))

    const gameId = await new DailyGameService(new DailyGameApi(), useGameStore()).startNewGame()

    expect(gameId).toBe(MOCK_DAILY_START_GAME_ID)
    expect(useGameStore().game).toMatchObject({ gameId: MOCK_DAILY_START_GAME_ID, gameMode: GameModes.Daily })
    expect(getCookie(CookieKeys.CURRENT_DAILY_GAME)).toBe(MOCK_DAILY_START_GAME_ID)
  })

  it('sends the stored user id as a Bearer token on the real request', async () => {
    setStoredUserId(BEARER_TOKEN_USER_ID)

    let receivedAuthHeader: string | null = null
    server.use(
      http.post('*/game/daily/start', ({ request }) => {
        receivedAuthHeader = request.headers.get('Authorization')
        return HttpResponse.json(MOCK_DAILY_START_GAME_ID)
      }),
    )

    await new DailyGameService(new DailyGameApi(), useGameStore()).startNewGame()

    expect(receivedAuthHeader).toBe(`Bearer ${BEARER_TOKEN_USER_ID}`)
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
    useGameStore().setGame(new GameStatus(EXISTING_GAME_ID, GameModes.Daily))
  })

  it('sends a well-formed guess request body', async () => {
    let capturedBody: MakeGuessBody | null = null
    server.use(
      http.post('*/game/daily/guess', async ({ request }) => {
        capturedBody = (await request.json()) as MakeGuessBody
        return HttpResponse.json(buildGuessResponse({ monsterCode: MONSTER_CODE_NARGACUGA }))
      }),
    )

    await new DailyGameService(new DailyGameApi(), useGameStore()).makeGuess(SHAPE_TEST_GAME_ID, MONSTER_CODE_NARGACUGA)

    expect(capturedBody).toEqual({
      gameId: SHAPE_TEST_GAME_ID,
      guessId: MONSTER_CODE_NARGACUGA,
    } satisfies MakeGuessBody)
  })

  it('sends the guess and records the result in the store', async () => {
    server.use(
      http.post('*/game/daily/guess', () => {
        return HttpResponse.json(buildGuessResponse({ gameStateAfterGuess: GameStates.Ongoing }))
      }),
    )

    await new DailyGameService(new DailyGameApi(), useGameStore()).makeGuess(EXISTING_GAME_ID, MONSTER_CODE_RATHALOS)

    const gameStore = useGameStore()
    expect(gameStore.game?.guesses).toHaveLength(1)
    expect(gameStore.game?.guesses[0]).toMatchObject({ monsterCode: MONSTER_CODE_RATHALOS })
    expect(gameStore.game?.state).toBe(GameStates.Ongoing)
  })

  it('propagates a Win state from the response to the store', async () => {
    server.use(
      http.post('*/game/daily/guess', () => {
        return HttpResponse.json(buildGuessResponse({ gameStateAfterGuess: GameStates.Win }))
      }),
    )

    await new DailyGameService(new DailyGameApi(), useGameStore()).makeGuess(EXISTING_GAME_ID, MONSTER_CODE_RATHALOS)

    expect(useGameStore().game?.state).toBe(GameStates.Win)
  })

  it('propagates a backend error instead of silently recording a guess', async () => {
    server.use(http.post('*/game/daily/guess', () => new HttpResponse(null, { status: 400 })))

    const gameService = new DailyGameService(new DailyGameApi(), useGameStore())

    await expect(gameService.makeGuess(EXISTING_GAME_ID, MONSTER_CODE_RATHALOS)).rejects.toThrow()
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
        return HttpResponse.json(buildGameStateResponse({ gameId: SHAPE_TEST_GAME_ID, gameMode: GameModes.Daily }))
      }),
    )

    await new DailyGameService(new DailyGameApi(), useGameStore()).resumeGame(SHAPE_TEST_GAME_ID)

    expect(capturedMethod).toBe('GET')
    expect(capturedGameId).toBe(SHAPE_TEST_GAME_ID)
  })

  it('resumes an ongoing game and reflects it in the store', async () => {
    server.use(
      http.get('*/game/daily/resume/:gameId', ({ params }) => {
        return HttpResponse.json(
          buildGameStateResponse({ gameId: params.gameId as string, gameMode: GameModes.Daily }),
        )
      }),
    )

    const isOngoing = await new DailyGameService(new DailyGameApi(), useGameStore()).resumeGame(EXISTING_GAME_ID)

    expect(isOngoing).toBe(true)
    expect(useGameStore().game).toMatchObject({ gameId: EXISTING_GAME_ID, gameMode: GameModes.Daily })
    expect(getCookie(CookieKeys.CURRENT_DAILY_GAME)).toBe(EXISTING_GAME_ID)
  })

  it('persists an already-finished game, and reports it as resumed', async () => {
    server.use(
      http.get('*/game/daily/resume/:gameId', () => {
        return HttpResponse.json(
          buildGameStateResponse({ gameId: EXISTING_GAME_ID, state: GameStates.Win, gameMode: GameModes.Daily }),
        )
      }),
    )

    const isGameSet = await new DailyGameService(new DailyGameApi(), useGameStore()).resumeGame(EXISTING_GAME_ID)

    expect(isGameSet).toBe(true)
    expect(useGameStore().game?.state).toBe(GameStates.Win)
  })

  it('returns false and leaves the store empty when the backend has no matching game', async () => {
    server.use(http.get('*/game/daily/resume/:gameId', () => new HttpResponse(null, { status: 404 })))

    const gameService = new DailyGameService(new DailyGameApi(), useGameStore())

    // DailyGameApi.resumeGame() does check `response.ok` before parsing — verified here
    // for this class specifically. A 404 with an empty body resolves to `null` cleanly.
    const isGameSet = await gameService.resumeGame(EXISTING_GAME_ID)

    expect(isGameSet).toBe(false)
    expect(useGameStore().isGameNull()).toBe(true)
    expect(getCookie(CookieKeys.CURRENT_DAILY_GAME)).toBeUndefined()
  })
})
