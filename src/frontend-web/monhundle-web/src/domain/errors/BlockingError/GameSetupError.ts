import { BaseBlockingError, ErrorReason } from '@/domain/errors/BlockingError/BaseBlockingError';

export class GameSetupError extends BaseBlockingError {
    constructor(msg: string, options?: ErrorOptions) {
        super(msg, ErrorReason.Critical, options);
    }
}
