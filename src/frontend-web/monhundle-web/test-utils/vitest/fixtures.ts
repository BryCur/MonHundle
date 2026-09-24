import { GameModes } from '@/domain/enums/GameModes';
import { GameStates } from '@/domain/enums/GameStates';
import type { GuessResponse } from '@/domain/generated/response/objects/GuessResponse';
import type { GameStateResponse } from '@/domain/generated/response/objects/GameStateResponse';

// --- Player / user identity ---
export const VALID_UUID = '11111111-1111-1111-1111-111111111111';
export const LOADED_USER_UUID = '22222222-2222-2222-2222-222222222222';
export const REQUESTING_USER_UUID = '33333333-3333-3333-3333-333333333333';
export const BEARER_TOKEN_USER_ID = 'player-42';

// --- Game identifiers ---
export const EXISTING_GAME_ID = 'g1';
export const SHAPE_TEST_GAME_ID = 'gid-shape-test';
export const MOCK_UNLIMITED_START_GAME_ID = 'mocked-unlimited-game-id';
export const MOCK_DAILY_START_GAME_ID = 'mocked-daily-game-id';

// --- Monster codes ---
export const MONSTER_CODE_RATHALOS = 'rathalos';
export const MONSTER_CODE_NARGACUGA = 'nargacuga';
export const MONSTER_CODE_DIABLOS = 'diablos';

// --- Game titles ---
export const GAME_TITLE_MHW = 'MHW';
export const GAME_TITLE_MHR = 'MHR';
export const SAMPLE_GAME_TITLES = [GAME_TITLE_MHW, GAME_TITLE_MHR];

// --- Response builders ---
export function buildGuessResponse(overrides: Partial<GuessResponse> = {}): GuessResponse {
    return {
        monsterCode: MONSTER_CODE_RATHALOS,
        gameStateAfterGuess: GameStates.Ongoing,
        ...overrides,
    };
}

export function buildGameStateResponse(
    overrides: Partial<GameStateResponse> = {},
): GameStateResponse {
    return {
        gameId: EXISTING_GAME_ID,
        state: GameStates.Ongoing,
        guesses: [],
        gameMode: GameModes.Unlimited,
        ...overrides,
    };
}
