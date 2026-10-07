// Base class for errors meant to be shown to the user as a notification
export abstract class BaseNotifiedError extends Error {
    constructor(msg: string, options?: ErrorOptions) {
        super(msg, options);
        this.name = new.target.name;
    }
}
