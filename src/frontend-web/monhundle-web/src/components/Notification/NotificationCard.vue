<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { onMounted, onUnmounted, ref } from 'vue';
import type { Notification } from '@/domain/Notification';

const { t } = useI18n();
const props = defineProps<{ notification: Notification }>();
const emit = defineEmits<{ dismiss: [id: number] }>();

const isHovered = ref(false);
const hasFocus = ref(false);

let dismissTimeoutId: ReturnType<typeof setTimeout> | undefined;
let remainingMs = props.notification.duration;
let startedAt = 0;

onMounted(() => {
    startTimeout();
});

onUnmounted(() => clearTimeout(dismissTimeoutId));

function dismissSelf() {
    emit('dismiss', props.notification.id);
}

function pauseTimeout() {
    if (dismissTimeoutId === undefined) {
        return; // already paused
    }

    remainingMs -= Date.now() - startedAt;
    clearTimeout(dismissTimeoutId);
    dismissTimeoutId = undefined;
}

function startTimeout() {
    if (dismissTimeoutId !== undefined || props.notification.duration <= 0) {
        return; // already in timeout, or not self-dismissed
    }

    startedAt = Date.now();
    dismissTimeoutId = setTimeout(dismissSelf, Math.max(0, remainingMs)); // possibly under 0 in some very edge cases
}

function updateTimeout() {
    if (isHovered.value || hasFocus.value) {
        pauseTimeout();
    } else {
        startTimeout();
    }
}
</script>

<template>
    <div
        class="notification-card"
        :class="'notification-' + notification.type"
        @mouseenter="
            isHovered = true;
            updateTimeout();
        "
        @mouseleave="
            isHovered = false;
            updateTimeout();
        "
        @focusin="
            hasFocus = true;
            updateTimeout();
        "
        @focusout="
            hasFocus = false;
            updateTimeout();
        "
    >
        <p v-if="notification.titleKey" class="notification-title">
            {{ t(notification.titleKey, notification.titleParams ?? {}) }}
        </p>
        <p class="notification-message">
            {{ t(notification.messageKey, notification.messageParams ?? {}) }}
        </p>
        <button
            v-if="notification.dismissible"
            class="notification-button-dismiss"
            @click="dismissSelf"
            type="button"
            :aria-label="t('accessibility.notification.close')"
        >
            x
        </button>
    </div>
</template>

<style lang="scss" scoped>
.notification-card {
    padding: 1rem;
    color: var(--color-notification-text);
}

.notification-error {
    background-color: var(--color-notification-error-bg);
    border-color: var(--color-notification-error-border);
}

.notification-success {
    background-color: var(--color-notification-success-bg);
    border-color: var(--color-notification-success-border);
}

.notification-info {
    background-color: var(--color-notification-info-bg);
    border-color: var(--color-notification-info-border);
}

.notification-warning {
    background-color: var(--color-notification-warning-bg);
    border-color: var(--color-notification-warning-border);
}
</style>
