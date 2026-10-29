import type { TranslationKey } from '@/domain/TranslationKey';

export enum NotificationTypes {
    Success = 'success',
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
}

export interface NotificationParams {
    type: NotificationTypes;
    messageKey: TranslationKey;
    messageParams?: Record<string, unknown>;
    titleKey?: TranslationKey;
    titleParams?: Record<string, unknown>;
    duration?: number; // 0 = manual closing required; milliseconds
    dismissible?: boolean; // if duration is 0 then needs to be true
}

export interface Notification extends NotificationParams {
    id: number;
    duration: number; // ms
    dismissible: boolean;
}
