import { describe, expect, it } from 'vitest';
import GameStatus from '@/domain/GameStatus';
import { GameModes, ComparisonOutcomes, type Guess } from '@/domain/ApiModels';

function guessWithResults(comparisonResult: Record<string, ComparisonOutcomes>): Guess {
    return { monsterCode: 'rathalos', criterias: {}, comparisonResult } as unknown as Guess;
}

describe('GameStatus', () => {
    it('appends guesses in order via addGuess', () => {
        const game = new GameStatus('abc', GameModes.Unlimited);

        game.addGuess({ monsterCode: 'a' } as Guess);
        game.addGuess({ monsterCode: 'b' } as Guess);

        expect(game.guesses.map((g) => g.monsterCode)).toEqual(['a', 'b']);
    });

    describe('convertGameToShareableString', () => {
        it('maps each comparison result to its emoji, in criterion order, one line per guess', () => {
            const game = new GameStatus('abc', GameModes.Unlimited, [
                guessWithResults({
                    classification: ComparisonOutcomes.Correct,
                    generation: ComparisonOutcomes.Incorrect,
                    weaknesses: ComparisonOutcomes.Higher,
                    afflictions: ComparisonOutcomes.Lower,
                    threatLevel: ComparisonOutcomes.Partial,
                    habitats: ComparisonOutcomes.Correct,
                }),
            ]);

            // order: classification, generation, weaknesses, afflictions, threatLevel, habitats
            expect(game.convertGameToShareableString()).toBe('🟩🟥🔺🔻🟨🟩\n');
        });

        it('produces one line per guess', () => {
            const allCorrect = {
                classification: ComparisonOutcomes.Correct,
                generation: ComparisonOutcomes.Correct,
                weaknesses: ComparisonOutcomes.Correct,
                afflictions: ComparisonOutcomes.Correct,
                threatLevel: ComparisonOutcomes.Correct,
                habitats: ComparisonOutcomes.Correct,
            };
            const game = new GameStatus('abc', GameModes.Unlimited, [
                guessWithResults(allCorrect),
                guessWithResults(allCorrect),
            ]);

            expect(game.convertGameToShareableString()).toBe('🟩🟩🟩🟩🟩🟩\n🟩🟩🟩🟩🟩🟩\n');
        });

        it('returns an empty string when there are no guesses', () => {
            const game = new GameStatus('abc', GameModes.Unlimited);

            expect(game.convertGameToShareableString()).toBe('');
        });
    });
});
