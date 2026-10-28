// enum that will define the content of the error page
export enum ErrorReason {
    Unavailable = 'unavailable', // when network error occurs, encourages retries
    Critical = 'critical', // something more serious than network error, should either try again later or report
    Unexpected = 'unexpected', // Anything not expected
}

// Base class for errors that will force a redirection to the error page
export abstract class BaseBlockingError extends Error {
    public readonly reason: ErrorReason;

    constructor(msg: string, reason: ErrorReason, options?: ErrorOptions) {
        super(msg, options);
        this.name = new.target.name;
        this.reason = reason;
    }
}
