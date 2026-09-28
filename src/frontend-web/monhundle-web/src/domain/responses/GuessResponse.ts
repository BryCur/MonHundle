import type { GameStates, ComparisonResult, Criterias } from '@/domain/ApiModels';

export default class GuessResponse {
    public readonly monsterCode: string;
    public readonly criterias: Criterias;
    public readonly comparisonResult: ComparisonResult;
    public readonly gameStateAfterGuess: GameStates;

    constructor(
        monsterCode: string,
        criterias: Criterias,
        compResult: ComparisonResult,
        state: GameStates,
    ) {
        this.monsterCode = monsterCode;
        this.criterias = criterias;
        this.comparisonResult = compResult;
        this.gameStateAfterGuess = state;
    }
}
