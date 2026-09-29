export class UnexpectedApiError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}
