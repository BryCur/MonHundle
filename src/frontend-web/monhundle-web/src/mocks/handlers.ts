import { HttpResponse, http } from 'msw'
import type { GuessResponse } from '@/domain/generated/response/objects/GuessResponse'
import type { GameStateResponse } from '@/domain/generated/response/objects/GameStateResponse'

// Default, happy-path handlers. Individual tests override these via `server.use(...)`
// (see afterEach(() => server.resetHandlers()) in vitest.setup.ts) when they need a
// specific response shape, an error status, or to inspect the request itself. Typed
// against the generated contract, so a backend change that drops/renames a field breaks
// this file at compile time instead of producing a silently-wrong mock.
export const handlers = [
  http.post('*/game/unlimited/start', () => {
    return HttpResponse.json('mocked-unlimited-game-id')
  }),

  http.post('*/game/unlimited/guess', () => {
    const response: GuessResponse = {
      monsterCode: 'rathalos',
      criterias: { generation: 1, threatLevel: 3, classification: 0, weaknesses: [], afflictions: [], habitats: [] },
      comparisonResult: {
        generation: 0,
        threatLevel: 0,
        classification: 0,
        weaknesses: 0,
        afflictions: 0,
        habitats: 0,
      },
      gameStateAfterGuess: 0, // GameStates.Ongoing
    }
    return HttpResponse.json(response)
  }),

  http.get('*/game/unlimited/resume/:gameId', ({ params }) => {
    const response: GameStateResponse = {
      gameId: params.gameId as string,
      state: 0, // GameStates.Ongoing
      guesses: [],
      gameMode: 0, // GameModes.Unlimited
    }
    return HttpResponse.json(response)
  }),

  http.post('*/game/daily/start', () => {
    return HttpResponse.json('mocked-daily-game-id')
  }),

  http.post('*/game/daily/guess', () => {
    const response: GuessResponse = { monsterCode: 'rathalos', gameStateAfterGuess: 0 } // GameStates.Ongoing
    return HttpResponse.json(response)
  }),

  http.get('*/game/daily/resume/:gameId', ({ params }) => {
    const response: GameStateResponse = {
      gameId: params.gameId as string,
      state: 0, // GameStates.Ongoing
      guesses: [],
      gameMode: 1, // GameModes.Daily
    }
    return HttpResponse.json(response)
  }),
]
