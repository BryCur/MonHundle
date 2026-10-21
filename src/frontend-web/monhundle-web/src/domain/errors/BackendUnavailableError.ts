export class BackendUnavailableError extends Error {
    public constructor(msg: string, options?: ErrorOptions) {
        super(msg, options);

        this.name = new.target.name;
    }
}
