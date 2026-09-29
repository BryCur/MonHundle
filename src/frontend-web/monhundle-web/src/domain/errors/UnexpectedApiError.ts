export class UnexpectedApiError extends Error {
    constructor(msg: string) {
        super(msg);

        Object.setPrototypeOf(this, UnexpectedApiError.prototype);
    }
}
