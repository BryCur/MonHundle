import type { ErrorReason } from '@/domain/errors/BlockingError/BaseBlockingError';

export interface IErrorNavigator {
    showErrorPage(reason: ErrorReason): void;
    isOnErrorPage(): boolean;
}
