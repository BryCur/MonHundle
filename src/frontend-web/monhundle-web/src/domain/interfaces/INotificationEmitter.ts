import type { NotificationParams } from '@/domain/Notification';

export default interface INotificationEmitter {
    notify(notificationParams: NotificationParams): void;
}
