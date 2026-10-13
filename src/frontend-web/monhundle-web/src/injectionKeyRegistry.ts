import type INotificationEmitter from '@/domain/interfaces/INotificationEmitter';
import type { InjectionKey } from 'vue';

export const notificationEmitterKey: InjectionKey<INotificationEmitter> =
    Symbol('notificationEmitter');
