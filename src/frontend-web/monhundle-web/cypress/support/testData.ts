// Shared fixed values and response builders for e2e specs. Kept as plain literals (no imports
// from src/) since Cypress's spec bundler doesn't resolve the project's Vite aliases.

export const FAKE_USER_ID = '11111111-1111-1111-1111-111111111111';
export const FAKE_GAME_ID = 'demo-game-id';
export const DEFAULT_GAME_TITLES = ['MHWilds', 'MHR'];
export const DEFAULT_MONSTERS = ['rathalos', 'diablos'];

// mirrors ComparisonResults: Incorrect, Partial, Correct, Higher, Lower
export const ComparisonResults = {
    Incorrect: 0,
    Partial: 1,
    Correct: 2,
    Higher: 3,
    Lower: 4,
} as const;

// mirrors GameStates: Ongoing, Win, Loss, Forfeited
export const GameStates = {
    Ongoing: 0,
    Win: 1,
    Loss: 2,
    Forfeited: 3,
} as const;

// mirrors GameModes: Unlimited, Daily
export const GameModes = {
    Unlimited: 0,
    Daily: 1,
} as const;

interface ComparisonOverrides {
    generation?: number;
    threatLevel?: number;
    classification?: number;
    weaknesses?: number;
    afflictions?: number;
    habitats?: number;
}

export function buildGuessResponse(
    monsterCode: string,
    gameStateAfterGuess: number,
    comparisonResult: ComparisonOverrides = {},
) {
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
            generation: ComparisonResults.Incorrect,
            threatLevel: ComparisonResults.Incorrect,
            classification: ComparisonResults.Incorrect,
            weaknesses: ComparisonResults.Incorrect,
            afflictions: ComparisonResults.Incorrect,
            habitats: ComparisonResults.Incorrect,
            ...comparisonResult,
        },
        gameStateAfterGuess,
    };
}
