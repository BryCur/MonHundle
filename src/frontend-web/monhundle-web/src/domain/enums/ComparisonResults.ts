export enum ComparisonResults {
    Incorrect,
    Partial,
    Correct,
    Higher,
    Lower
}

// to easily get the name of the enum, used for translations keys
export namespace ComparisonResults {
    export const enumName: string = "ComparisonResults"
}