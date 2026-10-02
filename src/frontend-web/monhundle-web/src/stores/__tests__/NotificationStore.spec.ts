import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNotificationStore } from '@/stores/NotificationStore';
import { NotificationTypes, type NotificationParams } from '@/domain/Notification';
import type INotificationEmitter from '@/domain/interfaces/INotificationEmitter';

const baseParams: NotificationParams = {
    type: NotificationTypes.Info,
    messageKey: 'notifications.test.message',
};

describe('NotificationStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('should start with an empty notification list', () => {
        const store = useNotificationStore();

        expect(store.notifications).toHaveLength(0);
    });

    describe('notify', () => {
        it('should add a notification carrying the given fields', () => {
            const store = useNotificationStore();

            store.notify({
                type: NotificationTypes.Warning,
                messageKey: 'notifications.test.message',
                messageParams: { count: 3 },
                titleKey: 'notifications.test.title',
                titleParams: { name: 'Rathalos' },
            });

            expect(store.notifications).toHaveLength(1);
            expect(store.notifications[0]).toMatchObject({
                type: NotificationTypes.Warning,
                messageKey: 'notifications.test.message',
                messageParams: { count: 3 },
                titleKey: 'notifications.test.title',
                titleParams: { name: 'Rathalos' },
            });
        });

        it.each([
            [NotificationTypes.Success, 5000],
            [NotificationTypes.Info, 5000],
            [NotificationTypes.Warning, 7000],
            [NotificationTypes.Error, 15000],
        ])('should give a %s notification a default duration of %i ms', (type, expected) => {
            const store = useNotificationStore();

            store.notify({ ...baseParams, type });

            expect(store.notifications[0]?.duration).toBe(expected);
        });

        it('should use the given duration over the default one', () => {
            const store = useNotificationStore();

            store.notify({ ...baseParams, duration: 1234 });

            expect(store.notifications[0]?.duration).toBe(1234);
        });

        it('should keep an explicit duration of 0', () => {
            const store = useNotificationStore();

            store.notify({ ...baseParams, duration: 0 });

            expect(store.notifications[0]?.duration).toBe(0);
        });

        it('should clamp a negative duration to 0 and make the notification dismissible', () => {
            const store = useNotificationStore();

            store.notify({ ...baseParams, duration: -500, dismissible: false });

            expect(store.notifications[0]?.duration).toBe(0);
            expect(store.notifications[0]?.dismissible).toBe(true);
        });

        it('should make a notification dismissible by default', () => {
            const store = useNotificationStore();

            store.notify(baseParams);

            expect(store.notifications[0]?.dismissible).toBe(true);
        });

        it('should keep a non-dismissible notification when it has a duration', () => {
            const store = useNotificationStore();

            store.notify({ ...baseParams, duration: 3000, dismissible: false });

            expect(store.notifications[0]?.dismissible).toBe(false);
        });

        it('should force a notification without duration to be dismissible', () => {
            const store = useNotificationStore();

            store.notify({ ...baseParams, duration: 0, dismissible: false });

            expect(store.notifications[0]?.dismissible).toBe(true);
        });

        it('should give each notification a unique id', () => {
            const store = useNotificationStore();

            store.notify(baseParams);
            store.notify(baseParams);
            store.notify(baseParams);

            const ids = store.notifications.map((n) => n.id);
            expect(new Set(ids).size).toBe(3);
        });

        it('should append notifications in the order they are emitted', () => {
            const store = useNotificationStore();

            store.notify({ ...baseParams, messageKey: 'first' });
            store.notify({ ...baseParams, messageKey: 'second' });

            expect(store.notifications.map((n) => n.messageKey)).toStrictEqual(['first', 'second']);
        });
    });

    describe('dismiss', () => {
        it('should remove only the targeted notification', () => {
            const store = useNotificationStore();
            store.notify({ ...baseParams, messageKey: 'first' });
            store.notify({ ...baseParams, messageKey: 'second' });
            store.notify({ ...baseParams, messageKey: 'third' });

            const secondId = store.notifications[1]!.id;
            store.dismiss(secondId);

            expect(store.notifications.map((n) => n.messageKey)).toStrictEqual(['first', 'third']);
        });

        it('should do nothing when the id is unknown or already dismissed', () => {
            const store = useNotificationStore();
            store.notify({ ...baseParams, messageKey: 'dismissed' });
            store.notify({ ...baseParams, messageKey: 'kept' });
            const dismissedId = store.notifications[0]!.id;
            const unknownId = Math.max(...store.notifications.map((n) => n.id)) + 1;

            store.dismiss(dismissedId);
            store.dismiss(dismissedId);
            store.dismiss(unknownId);

            expect(store.notifications.map((n) => n.messageKey)).toStrictEqual(['kept']);
        });
    });

    it('should be usable as an INotificationEmitter', () => {
        const store = useNotificationStore();
        // compile-time check (npm run type-check): the store satisfies the interface
        const emitter: INotificationEmitter = store;

        emitter.notify(baseParams);

        expect(store.notifications).toHaveLength(1);
    });
});
