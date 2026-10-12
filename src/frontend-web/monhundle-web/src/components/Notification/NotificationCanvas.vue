<script setup lang="ts">
import { useNotificationStore } from '@/stores/NotificationStore';
import { computed } from 'vue';
import type { Notification } from '@/domain/Notification';
import NotificationCard from '@/components/Notification/NotificationCard.vue';
import { useI18n } from 'vue-i18n';

export type NotificationPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const { t } = useI18n();
const { maxNotifications = 5, position = 'bottom-right' } = defineProps<{
    maxNotifications?: number;
    position?: NotificationPosition;
}>();

const notificationStore = useNotificationStore();
const visibleNotifications = computed<Notification[]>(() =>
    notificationStore.notifications.slice(0, maxNotifications),
);
</script>

<template>
    <section
        class="notification-canvas"
        :class="`notification-canvas--${position}`"
        :aria-label="t('accessibility.notification.region')"
        aria-live="polite"
    >
        <TransitionGroup name="notification" tag="ul">
            <li v-for="notification in visibleNotifications" :key="notification.id">
                <NotificationCard
                    :notification="notification"
                    @dismiss="notificationStore.dismiss"
                ></NotificationCard>
            </li>
        </TransitionGroup>
    </section>
</template>

<style lang="scss" scoped>
.notification-canvas {
    position: fixed;
    z-index: 999;
    padding: 1rem;
    width: min(24rem, calc(100vw - 2rem));
    pointer-events: none;

    ul {
        list-style: none;
        padding: 0;

        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
}

.notification-canvas--top-left {
    top: 0;
    left: 0;
}

.notification-canvas--bottom-left {
    bottom: 0;
    left: 0;
}

.notification-canvas--top-right {
    top: 0;
    right: 0;
}

.notification-canvas--bottom-right {
    bottom: 0;
    right: 0;
}
</style>
