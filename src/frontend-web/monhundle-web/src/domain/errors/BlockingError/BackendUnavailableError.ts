import { BaseBlockingError, ErrorReason } from '@/domain/errors/BlockingError/BaseBlockingError';

export class BackendUnavailableError extends BaseBlockingError {
    public constructor(msg: string, options?: ErrorOptions) {
        super(msg, ErrorReason.Unavailable, options);
    }
}
