import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    errorToNotification,
    reportError,
} from '@/domain/errors/NotifiedError/ErrorToNotification';
import { LoadFailedError } from '@/domain/errors/NotifiedError/LoadFailedError';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';
import { NotificationTypes } from '@/domain/Notification';
import type INotificationEmitter from '@/domain/interfaces/INotificationEmitter';

const DEFAULT_NOTIFICATION = {
    type: NotificationTypes.Error,
    messageKey: 'ui.notification.error.default.message',
};

describe('errorToNotification', () => {
    it.each([
        ['AllGameTitle', 'ui.notification.error.gameTitlesLoadFailed.message'],
        ['MonsterOptions', 'ui.notification.error.monsterOptionsLoadFailed.message'],
    ])('maps a LoadFailedError on %s to its own message', (resource, messageKey) => {
        const notification = errorToNotification(new LoadFailedError('could not load', resource));

        expect(notification).toStrictEqual({ type: NotificationTypes.Error, messageKey });
    });

    it('falls back to the default message for a LoadFailedError on an unknown resource', () => {
        const notification = errorToNotification(
            new LoadFailedError('could not load', 'UnknownResource'),
        );

        expect(notification).toStrictEqual(DEFAULT_NOTIFICATION);
    });

    it.each([
        ['a plain Error', new Error('boom')],
        ['a non-notified custom error', new UnexpectedApiError('could not get resource', 500)],
        ['a thrown string', 'boom'],
        ['undefined', undefined],
        ['a plain object', { message: 'boom' }],
    ])('falls back to the default message for %s', (_label, error) => {
        expect(errorToNotification(error)).toStrictEqual(DEFAULT_NOTIFICATION);
    });

    it('returns a fresh object on every call', () => {
        const first = errorToNotification(new Error('boom'));
        first.messageKey = 'tampered';

        expect(errorToNotification(new Error('boom'))).toStrictEqual(DEFAULT_NOTIFICATION);
    });
});

describe('reportError', () => {
    let emitter: INotificationEmitter & { notify: ReturnType<typeof vi.fn> };
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        emitter = { notify: vi.fn() };
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it('logs a notified error as a warning, with its origin', () => {
        const error = new LoadFailedError('could not load', 'AllGameTitle');

        reportError(error, emitter, 'vue: mounted hook');

        expect(consoleWarnSpy).toHaveBeenCalledWith('[vue: mounted hook]', error);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it.each([
        ['a plain Error', new Error('boom')],
        ['a thrown string', 'boom'],
    ])('logs %s as an error, with its origin', (_label, error) => {
        reportError(error, emitter, 'unhandled rejection');

        expect(consoleErrorSpy).toHaveBeenCalledWith('[unhandled rejection]', error);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('notifies once with the notification matching a notified error', () => {
        reportError(new LoadFailedError('could not load', 'MonsterOptions'), emitter, 'origin');

        expect(emitter.notify).toHaveBeenCalledTimes(1);
        expect(emitter.notify).toHaveBeenCalledWith({
            type: NotificationTypes.Error,
            messageKey: 'ui.notification.error.monsterOptionsLoadFailed.message',
        });
    });

    it('notifies once with the default notification for any other error', () => {
        reportError(new Error('boom'), emitter, 'origin');

        expect(emitter.notify).toHaveBeenCalledTimes(1);
        expect(emitter.notify).toHaveBeenCalledWith(DEFAULT_NOTIFICATION);
    });
});
