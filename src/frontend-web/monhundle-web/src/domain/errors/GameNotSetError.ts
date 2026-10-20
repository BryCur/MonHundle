export class GameNotSetError extends Error {
    constructor(msg: string) {
        super(msg);

        Object.setPrototypeOf(this, GameNotSetError.prototype);
    }
}
