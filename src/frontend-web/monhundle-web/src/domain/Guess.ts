import type { ComparisonResult } from "./interfaces/ComparisonResult";
import type { Criterias } from "./interfaces/Criteras";

export default class Guess {
    public readonly monsterCode: string;
    public readonly criterias: Criterias;
    public readonly comparisonResult: ComparisonResult;

    constructor(monsterCode: string, criterias: Criterias, compResult: ComparisonResult) {
        this.monsterCode = monsterCode;
        this.criterias = criterias;
        this.comparisonResult = compResult;
    }
}

