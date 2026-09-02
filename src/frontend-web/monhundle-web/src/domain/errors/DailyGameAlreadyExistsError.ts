export class DailyGameAlreadyExistsError extends Error {
    private existingGameId: string;
    constructor(msg: string, gameId: string) {
        super(`${msg}; existing game id: ${gameId}`);
        this.existingGameId = gameId;

        Object.setPrototypeOf(this, DailyGameAlreadyExistsError.prototype);
    }

    public get getExistingGameId(): string {return this.existingGameId; }
}