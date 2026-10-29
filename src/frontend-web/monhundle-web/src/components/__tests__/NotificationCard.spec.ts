import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import NotificationCard from '@/components/Notification/NotificationCard.vue';
import { NotificationTypes, type Notification } from '@/domain/Notification';
import { testKey } from '@test-utils/vitest/fixtures';

const i18n = createI18n({
    legacy: false,
    globalInjection: false,
    missingWarn: false,
    fallbackWarn: false,
    locale: 'en',
    messages: {
        en: {
            test: {
                message: 'Could not load {what}',
                title: 'Loading {status}',
            },
        },
    },
});

function buildNotification(overrides: Partial<Notification> = {}): Notification {
    return {
        id: 42,
        type: NotificationTypes.Info,
        messageKey: testKey('test.message'),
        messageParams: { what: 'monsters' },
        duration: 5000,
        dismissible: true,
        ...overrides,
    };
}

let wrapper: VueWrapper | undefined;

function mountCard(overrides: Partial<Notification> = {}) {
    wrapper = mount(NotificationCard, {
        props: { notification: buildNotification(overrides) },
        global: { plugins: [i18n] },
    });
    return wrapper;
}

describe('NotificationCard', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
        vi.useRealTimers();
    });

    describe('content', () => {
        it('shows the translated message with its params', () => {
            const card = mountCard();

            expect(card.find('.notification-message').text()).toBe('Could not load monsters');
        });

        it('shows the translated title with its params when there is one', () => {
            const card = mountCard({
                titleKey: testKey('test.title'),
                titleParams: { status: 'failed' },
            });

            expect(card.find('.notification-title').text()).toBe('Loading failed');
        });

        it('shows no title when there is none', () => {
            const card = mountCard();

            expect(card.find('.notification-title').exists()).toBe(false);
        });

        it.each(Object.values(NotificationTypes))(
            'applies the class of a %s notification',
            (type) => {
                const card = mountCard({ type });

                expect(card.classes()).toContain(`notification-${type}`);
            },
        );
    });

    describe('dismiss button', () => {
        it('emits dismiss with the notification id when clicked', async () => {
            const card = mountCard();

            await card.find('button').trigger('click');

            expect(card.emitted('dismiss')).toStrictEqual([[42]]);
        });

        it('has an accessible label', () => {
            const card = mountCard();

            expect(card.find('button').attributes('aria-label')).toBe(
                'accessibility.notification.close',
            );
        });

        it('is absent when the notification is not dismissible', () => {
            const card = mountCard({ dismissible: false });

            expect(card.find('button').exists()).toBe(false);
        });
    });

    describe('timeout', () => {
        it('emits dismiss once its duration has elapsed', () => {
            const card = mountCard({ duration: 5000 });

            vi.advanceTimersByTime(4999);
            expect(card.emitted('dismiss')).toBeUndefined();

            vi.advanceTimersByTime(1);
            expect(card.emitted('dismiss')).toStrictEqual([[42]]);
        });

        it('never dismisses itself when its duration is 0', () => {
            const card = mountCard({ duration: 0 });

            vi.advanceTimersByTime(60_000);

            expect(card.emitted('dismiss')).toBeUndefined();
        });

        it('pauses while hovered and resumes with the remaining time', async () => {
            const card = mountCard({ duration: 5000 });

            vi.advanceTimersByTime(2000);
            await card.trigger('mouseenter');
            vi.advanceTimersByTime(10_000);
            expect(card.emitted('dismiss')).toBeUndefined();

            await card.trigger('mouseleave');
            vi.advanceTimersByTime(2999);
            expect(card.emitted('dismiss')).toBeUndefined();

            vi.advanceTimersByTime(1);
            expect(card.emitted('dismiss')).toStrictEqual([[42]]);
        });

        it('pauses while focused and resumes with the remaining time', async () => {
            const card = mountCard({ duration: 5000 });

            vi.advanceTimersByTime(2000);
            await card.trigger('focusin');
            vi.advanceTimersByTime(10_000);
            expect(card.emitted('dismiss')).toBeUndefined();

            await card.trigger('focusout');
            vi.advanceTimersByTime(3000);
            expect(card.emitted('dismiss')).toStrictEqual([[42]]);
        });

        it('stays paused while still focused after the pointer leaves', async () => {
            const card = mountCard({ duration: 5000 });

            await card.trigger('mouseenter');
            await card.trigger('focusin');
            await card.trigger('mouseleave');
            vi.advanceTimersByTime(10_000);
            expect(card.emitted('dismiss')).toBeUndefined();

            await card.trigger('focusout');
            vi.advanceTimersByTime(5000);
            expect(card.emitted('dismiss')).toStrictEqual([[42]]);
        });

        it('dismisses right away when resumed after its time ran out during the pause', async () => {
            const card = mountCard({ duration: 1000 });

            // the clock passes the deadline before the timeout callback gets to run
            vi.setSystemTime(Date.now() + 1200);
            await card.trigger('mouseenter');
            await card.trigger('mouseleave');
            vi.advanceTimersByTime(0);

            expect(card.emitted('dismiss')).toStrictEqual([[42]]);
        });

        it('does not dismiss after being unmounted', () => {
            const card = mountCard({ duration: 5000 });

            card.unmount();
            vi.advanceTimersByTime(5000);

            expect(card.emitted('dismiss')).toBeUndefined();
            wrapper = undefined;
        });
    });

    describe('countdown', () => {
        it('shows a countdown lasting the notification duration', () => {
            const card = mountCard({ duration: 5000 });

            expect(card.classes()).toContain('notification-card--timed');
            expect(card.attributes('style')).toContain('--notification-duration: 5000ms');
        });

        it('shows no countdown when the notification has no duration', () => {
            const card = mountCard({ duration: 0 });

            expect(card.classes()).not.toContain('notification-card--timed');
        });

        it.each([
            ['hovered', 'mouseenter', 'mouseleave'],
            ['focused', 'focusin', 'focusout'],
        ] as const)('pauses the countdown while %s', async (_label, pauseEvent, resumeEvent) => {
            const card = mountCard();
            expect(card.classes()).not.toContain('notification-card--paused');

            await card.trigger(pauseEvent);
            expect(card.classes()).toContain('notification-card--paused');

            await card.trigger(resumeEvent);
            expect(card.classes()).not.toContain('notification-card--paused');
        });
    });
});
