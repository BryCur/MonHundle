import type { GameStates } from "../enums/GameStates";
import type { ComparisonResult } from "../interfaces/ComparisonResult";
import type { Criterias } from "../interfaces/Criteras";

export default class GuessResponse {
    public readonly monsterCode: string;
    public readonly criterias: Criterias;
    public readonly comparisonResult: ComparisonResult;
    public readonly gameStateAfterGuess: GameStates;

    constructor(monsterCode: string, criterias: Criterias, compResult: ComparisonResult, state: GameStates) {
        this.monsterCode = monsterCode;
        this.criterias = criterias;
        this.comparisonResult = compResult;
        this.gameStateAfterGuess = state;
    }
}

