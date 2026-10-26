import type IServiceStatusApi from '@/domain/interfaces/api-contracts/IServiceStatusApi';
import type ISettingApi from '@/domain/interfaces/api-contracts/ISettingApi';
import type INotificationEmitter from '@/domain/interfaces/INotificationEmitter';
import type IGameService from '@/domain/interfaces/services/IGameService';
import type IResourceService from '@/domain/interfaces/services/IResourceService';
import { inject, type InjectionKey } from 'vue';

export const notificationEmitterKey: InjectionKey<INotificationEmitter> =
    Symbol('notificationEmitter');
export const unlimitedGameServiceKey: InjectionKey<IGameService> = Symbol('unlimitedGameService');
export const dailyGameServiceKey: InjectionKey<IGameService> = Symbol('dailyGameService');
export const resourceServiceKey: InjectionKey<IResourceService> = Symbol('resourceService');
export const settingsApiKey: InjectionKey<ISettingApi> = Symbol('settingsApi');
export const serviceStatusApiKey: InjectionKey<IServiceStatusApi> = Symbol('serviceStatusApi');

export function injectStrict<T>(key: InjectionKey<T>): T {
    const resolved = inject(key);

    if (resolved === undefined) {
        throw new Error(`No provider found for injection key "${key.description}"`);
    }

    return resolved;
}
