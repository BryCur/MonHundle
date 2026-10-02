export enum NotificationTypes {
    Success = 'success',
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
}

export interface NotificationParams {
    type: NotificationTypes;
    messageKey: string;
    messageParams?: Record<string, unknown>;
    titleKey?: string;
    titleParams?: Record<string, unknown>;
    duration?: number; // 0 = manual closing required; milliseconds
    dismissible?: boolean; // if duration is 0 then needs to be true
}

export interface Notification extends NotificationParams {
    id: number;
    duration: number; // ms
    dismissible: boolean;
}
