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
        <!-- transition group helps managing animation and transition for multiple childrens,
         name prop serves as a prefix for affixed classes-->
        <TransitionGroup name="notification" tag="ul">
            <li
                v-for="notification in visibleNotifications"
                :key="notification.id"
                class="notification-item"
            >
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
    padding: 2rem;
    width: min(28rem, calc(100vw - 2rem));
    pointer-events: none;
    // horizontal offset the cards slide from/to, towards the edge the canvas is anchored to
    --notification-slide: 2rem;

    ul {
        list-style: none;
        padding: 0;

        display: flex;
        flex-direction: column;
    }
}

.notification-canvas--top-left {
    top: 0;
    left: 0;
    --notification-slide: -2rem;
}

.notification-canvas--bottom-left {
    bottom: 0;
    left: 0;
    --notification-slide: -2rem;
}

.notification-canvas--top-right {
    top: 0;
    right: 0;
}

.notification-canvas--bottom-right {
    bottom: 0;
    right: 0;
}

.notification-item {
    display: grid;
    grid-template-rows: 1fr;
    padding-block: 0.25rem;

    > * {
        min-height: 0;
    }
}

.notification-enter-active {
    transition:
        grid-template-rows 200ms ease-out,
        padding 200ms ease-out,
        opacity 250ms ease-out,
        transform 250ms ease-out;
}

// leaving: slide and fade out first, then close the space once the card is invisible
.notification-leave-active {
    pointer-events: none;
    transition:
        opacity 200ms ease-in,
        transform 200ms ease-in,
        grid-template-rows 150ms ease-in 200ms,
        padding 150ms ease-in 200ms;
}

.notification-enter-from,
.notification-leave-to {
    grid-template-rows: 0fr;
    padding-block: 0;
    opacity: 0;
    transform: translateX(var(--notification-slide));
}

.notification-move {
    transition: transform 250ms ease;
}

// no sliding nor resizing for users asking for reduced motion, only a short fade
@media (prefers-reduced-motion: reduce) {
    .notification-enter-active,
    .notification-leave-active {
        transition: opacity 150ms linear;
    }

    .notification-enter-from,
    .notification-leave-to {
        grid-template-rows: 1fr;
        padding-block: 0.25rem;
        transform: none;
    }

    .notification-move {
        transition: none;
    }
}
</style>
