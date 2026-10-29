import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import NotificationCanvas from '@/components/Notification/NotificationCanvas.vue';
import NotificationCard from '@/components/Notification/NotificationCard.vue';
import { useNotificationStore } from '@/stores/NotificationStore';
import { NotificationTypes } from '@/domain/Notification';
import { testKey } from '@test-utils/vitest/fixtures';

const i18n = createI18n({
    legacy: false,
    globalInjection: false,
    missingWarn: false,
    fallbackWarn: false,
    locale: 'en',
    messages: { en: {} },
});

let pinia: Pinia;
let wrapper: VueWrapper | undefined;

function mountCanvas(props: InstanceType<typeof NotificationCanvas>['$props'] = {}) {
    wrapper = mount(NotificationCanvas, {
        props,
        global: { plugins: [pinia, i18n] },
    });
    return wrapper;
}

function notify(messageKey: string) {
    useNotificationStore().notify({
        type: NotificationTypes.Info,
        messageKey: testKey(messageKey),
    });
}

function shownMessages(canvas: VueWrapper) {
    return canvas.findAll('.notification-message').map((message) => message.text());
}

describe('NotificationCanvas', () => {
    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
    });

    it('is a labelled polite live region, even without any notification', () => {
        const canvas = mountCanvas();

        const region = canvas.find('section');
        expect(region.attributes('aria-live')).toBe('polite');
        expect(region.attributes('aria-label')).toBe('accessibility.notification.region');
        expect(canvas.findAllComponents(NotificationCard)).toHaveLength(0);
    });

    it('shows the store notifications, the most recent last', async () => {
        const canvas = mountCanvas();

        notify('first');
        notify('second');
        await canvas.vm.$nextTick();

        expect(shownMessages(canvas)).toStrictEqual(['first', 'second']);
    });

    it('shows at most maxNotifications, keeping the oldest ones', async () => {
        const canvas = mountCanvas({ maxNotifications: 2 });

        notify('first');
        notify('second');
        notify('third');
        await canvas.vm.$nextTick();

        expect(shownMessages(canvas)).toStrictEqual(['first', 'second']);
    });

    it('shows 5 notifications at most by default', async () => {
        const canvas = mountCanvas();

        for (let i = 0; i < 7; i++) {
            notify(`message ${i}`);
        }
        await canvas.vm.$nextTick();

        expect(canvas.findAllComponents(NotificationCard)).toHaveLength(5);
    });

    it('removes a notification from the store when its card is dismissed', async () => {
        const canvas = mountCanvas();
        notify('first');
        notify('second');
        await canvas.vm.$nextTick();

        await canvas.find('button').trigger('click');

        const store = useNotificationStore();
        expect(store.notifications.map((n) => n.messageKey)).toStrictEqual(['second']);
        expect(shownMessages(canvas)).toStrictEqual(['second']);
    });

    it('shows a waiting notification once a visible one is dismissed', async () => {
        const canvas = mountCanvas({ maxNotifications: 1 });
        notify('first');
        notify('second');
        await canvas.vm.$nextTick();

        await canvas.find('button').trigger('click');

        expect(shownMessages(canvas)).toStrictEqual(['second']);
    });

    it('is placed bottom-right by default', () => {
        const canvas = mountCanvas();

        expect(canvas.find('section').classes()).toContain('notification-canvas--bottom-right');
    });

    it('is placed at the given position', () => {
        const canvas = mountCanvas({ position: 'top-left' });

        expect(canvas.find('section').classes()).toContain('notification-canvas--top-left');
    });
});
