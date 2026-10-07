export class UnexpectedApiError extends Error {
    public readonly httpStatus?: number;

    constructor(msg: string, status?: number) {
        super(msg);
        this.httpStatus = status;
    }
}
