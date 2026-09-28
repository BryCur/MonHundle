// Shared fixed values and response builders for e2e specs. Payloads are typed with the models
// generated from the backend contract, so the stubbed responses can't drift from the real API.

import {
    ComparisonOutcomes,
    type ComparisonResult,
    type GameStates,
    type GuessResponse,
} from '@/domain/ApiModels';

export const FAKE_USER_ID = '11111111-1111-1111-1111-111111111111';
export const FAKE_GAME_ID = 'demo-game-id';
export const DEFAULT_GAME_TITLES = ['MHWilds', 'MHR'];
export const DEFAULT_MONSTERS = ['rathalos', 'diablos'];

export function buildGuessResponse(
    monsterCode: string,
    gameStateAfterGuess: GameStates,
    comparisonResult: Partial<ComparisonResult> = {},
): GuessResponse {
    return {
        monsterCode,
        criterias: {
            generation: 3,
            threatLevel: 5,
            classification: 0,
            weaknesses: [],
            afflictions: [],
            habitats: [],
        },
        comparisonResult: {
            generation: ComparisonOutcomes.Incorrect,
            threatLevel: ComparisonOutcomes.Incorrect,
            classification: ComparisonOutcomes.Incorrect,
            weaknesses: ComparisonOutcomes.Incorrect,
            afflictions: ComparisonOutcomes.Incorrect,
            habitats: ComparisonOutcomes.Incorrect,
            ...comparisonResult,
        },
        gameStateAfterGuess,
    };
}
