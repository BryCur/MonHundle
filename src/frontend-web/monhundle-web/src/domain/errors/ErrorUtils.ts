import { BaseBlockingError } from '@/domain/errors/BlockingError/BaseBlockingError';
import { BaseNotifiedError } from '@/domain/errors/NotifiedError/BaseNotifiedError';
import { LoadFailedError } from '@/domain/errors/NotifiedError/LoadFailedError';
import type { IErrorNavigator } from '@/domain/interfaces/IErrorNavigator';
import type INotificationEmitter from '@/domain/interfaces/INotificationEmitter';
import { NotificationTypes, type NotificationParams } from '@/domain/Notification';

const DEFAULT_ERROR_NOTIFICATION = { messageKey: 'ui.notification.error.default.message' };
export type ErrorReporter = (error: unknown, origin: string) => void;

const LOAD_FAILED_NOTIFICATIONS: Record<string, { messageKey: string; titleKey?: string }> = {
    AllGameTitle: { messageKey: 'ui.notification.error.gameTitlesLoadFailed.message' },
    MonsterOptions: { messageKey: 'ui.notification.error.monsterOptionsLoadFailed.message' },
};

export function errorToNotification(error: unknown): NotificationParams {
    if (error instanceof LoadFailedError) {
        return {
            type: NotificationTypes.Error,
            ...(LOAD_FAILED_NOTIFICATIONS[error.resource] ?? DEFAULT_ERROR_NOTIFICATION),
        };
    }

    return {
        type: NotificationTypes.Error,
        ...DEFAULT_ERROR_NOTIFICATION,
    };
}

export function createErrorReporter(
    emitter: INotificationEmitter,
    errNavigator: IErrorNavigator,
): ErrorReporter {
    return (error: unknown, origin: string) => {
        if (error instanceof BaseBlockingError) {
            // error that needs navigation
            console.error(`[${origin}]`, error);
            if (!errNavigator.isOnErrorPage()) {
                errNavigator.showErrorPage(error.reason);
            }
            return;
        }

        if (error instanceof BaseNotifiedError) {
            console.warn(`[${origin}]`, error); // error within expectation, warn in console
        } else {
            console.error(`[${origin}]`, error); // some missed coverage, prolly a bug
        }

        emitter.notify(errorToNotification(error));
    };
}
