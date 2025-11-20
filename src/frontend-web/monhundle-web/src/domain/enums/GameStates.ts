export enum GameStates {
    Ongoing, Win, Loss, Forfeited
}

// to easily get the name of the enum, used for translations keys
export namespace GameStates {
    export const enumName: string = "GameStates"
}