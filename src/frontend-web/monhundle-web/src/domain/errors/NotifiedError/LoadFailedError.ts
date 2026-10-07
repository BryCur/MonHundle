import { BaseNotifiedError } from '@/domain/errors/NotifiedError/BaseNotifiedError';

export class LoadFailedError extends BaseNotifiedError {
    public readonly resource: string;

    constructor(msg: string, resource: string, options?: ErrorOptions) {
        super(msg, options);
        this.resource = resource;
    }
}
