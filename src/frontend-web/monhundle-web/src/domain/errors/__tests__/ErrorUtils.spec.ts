import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createErrorReporter,
    errorToNotification,
    type ErrorReporter,
} from '@/domain/errors/ErrorUtils';
import { BaseBlockingError, ErrorReason } from '@/domain/errors/BlockingError/BaseBlockingError';
import { BackendUnavailableError } from '@/domain/errors/BlockingError/BackendUnavailableError';
import { LoadFailedError } from '@/domain/errors/NotifiedError/LoadFailedError';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';
import { NotificationTypes } from '@/domain/Notification';
import type INotificationEmitter from '@/domain/interfaces/INotificationEmitter';
import type { IErrorNavigator } from '@/domain/interfaces/IErrorNavigator';

// BaseBlockingError is abstract: blocking cases go through a minimal subclass
class TestBlockingError extends BaseBlockingError {}

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

describe('createErrorReporter', () => {
    let emitter: INotificationEmitter & { notify: ReturnType<typeof vi.fn> };
    let errNavigator: IErrorNavigator & {
        showErrorPage: ReturnType<typeof vi.fn>;
        isOnErrorPage: ReturnType<typeof vi.fn>;
    };
    let report: ErrorReporter;
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        emitter = { notify: vi.fn() };
        errNavigator = { showErrorPage: vi.fn(), isOnErrorPage: vi.fn().mockReturnValue(false) };
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        report = createErrorReporter(emitter, errNavigator);
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it('does nothing when created, before any error is reported', () => {
        expect(emitter.notify).not.toHaveBeenCalled();
        expect(errNavigator.showErrorPage).not.toHaveBeenCalled();
        expect(errNavigator.isOnErrorPage).not.toHaveBeenCalled();
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    describe('with a blocking error', () => {
        it.each([
            ['a critical blocking error', new TestBlockingError('boom', ErrorReason.Critical)],
            ['a BackendUnavailableError', new BackendUnavailableError('service unreachable')],
        ])('shows the error page once with the reason of %s', (_label, error) => {
            report(error, 'origin');

            expect(errNavigator.showErrorPage).toHaveBeenCalledTimes(1);
            expect(errNavigator.showErrorPage).toHaveBeenCalledWith(error.reason);
        });

        it('does not notify', () => {
            report(new TestBlockingError('boom', ErrorReason.Critical), 'origin');

            expect(emitter.notify).not.toHaveBeenCalled();
        });

        it('logs it as an error, with its origin', () => {
            const error = new TestBlockingError('boom', ErrorReason.Critical);

            report(error, 'vue: mounted hook');

            expect(consoleErrorSpy).toHaveBeenCalledWith('[vue: mounted hook]', error);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('does not show the error page again when it is already shown, but still logs', () => {
            errNavigator.isOnErrorPage.mockReturnValue(true);
            const error = new TestBlockingError('boom', ErrorReason.Critical);

            report(error, 'origin');

            expect(errNavigator.showErrorPage).not.toHaveBeenCalled();
            expect(emitter.notify).not.toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith('[origin]', error);
        });
    });

    describe('with a non-blocking error', () => {
        it('logs a notified error as a warning, with its origin', () => {
            const error = new LoadFailedError('could not load', 'AllGameTitle');

            report(error, 'vue: mounted hook');

            expect(consoleWarnSpy).toHaveBeenCalledWith('[vue: mounted hook]', error);
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it.each([
            ['a plain Error', new Error('boom')],
            ['a thrown string', 'boom'],
        ])('logs %s as an error, with its origin', (_label, error) => {
            report(error, 'unhandled rejection');

            expect(consoleErrorSpy).toHaveBeenCalledWith('[unhandled rejection]', error);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('notifies once with the notification matching a notified error', () => {
            report(new LoadFailedError('could not load', 'MonsterOptions'), 'origin');

            expect(emitter.notify).toHaveBeenCalledTimes(1);
            expect(emitter.notify).toHaveBeenCalledWith({
                type: NotificationTypes.Error,
                messageKey: 'ui.notification.error.monsterOptionsLoadFailed.message',
            });
        });

        it('notifies once with the default notification for any other error', () => {
            report(new Error('boom'), 'origin');

            expect(emitter.notify).toHaveBeenCalledTimes(1);
            expect(emitter.notify).toHaveBeenCalledWith(DEFAULT_NOTIFICATION);
        });

        it.each([
            ['a notified error', new LoadFailedError('could not load', 'AllGameTitle')],
            ['a plain Error', new Error('boom')],
        ])('never touches the error navigator for %s', (_label, error) => {
            report(error, 'origin');

            expect(errNavigator.showErrorPage).not.toHaveBeenCalled();
            expect(errNavigator.isOnErrorPage).not.toHaveBeenCalled();
        });
    });

    it('uses the dependencies of its own creation', () => {
        const otherEmitter = { notify: vi.fn() };
        const otherNavigator = { showErrorPage: vi.fn(), isOnErrorPage: vi.fn(() => false) };
        const otherReport = createErrorReporter(otherEmitter, otherNavigator);

        otherReport(new Error('boom'), 'origin');
        otherReport(new TestBlockingError('boom', ErrorReason.Critical), 'origin');

        expect(otherEmitter.notify).toHaveBeenCalledTimes(1);
        expect(otherNavigator.showErrorPage).toHaveBeenCalledTimes(1);
        expect(emitter.notify).not.toHaveBeenCalled();
        expect(errNavigator.showErrorPage).not.toHaveBeenCalled();
    });
});
