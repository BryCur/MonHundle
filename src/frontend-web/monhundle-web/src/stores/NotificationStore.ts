import {
    NotificationTypes,
    type Notification,
    type NotificationParams,
} from '@/domain/Notification';
import { defineStore } from 'pinia';

let nextId = 0;

const DEFAULT_DURATIONS_MS: Record<NotificationTypes, number> = {
    [NotificationTypes.Success]: 5000,
    [NotificationTypes.Info]: 5000,
    [NotificationTypes.Warning]: 7000,
    [NotificationTypes.Error]: 15000,
};

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        notifications: [] as Notification[],
    }),

    actions: {
        notify(params: NotificationParams): void {
            const duration = Math.max(0, params.duration ?? DEFAULT_DURATIONS_MS[params.type]);
            const dismissible = duration === 0 || (params.dismissible ?? true);

            const newNotification: Notification = {
                ...params,
                duration,
                dismissible,
                id: nextId++,
            };

            this.notifications.push(newNotification);
        },

        dismiss(id: number): void {
            this.notifications = this.notifications.filter((n) => n.id !== id);
        },
    },
});
