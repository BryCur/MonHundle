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
        :class="[
            'notification-' + notification.type,
            {
                'notification-card--timed': notification.duration > 0,
                'notification-card--paused': isHovered || hasFocus,
            },
        ]"
        :style="{ '--notification-duration': `${notification.duration}ms` }"
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
        <div class="notification-content">
            <p v-if="notification.titleKey" class="notification-title">
                {{ t(notification.titleKey, notification.titleParams ?? {}) }}
            </p>
            <p class="notification-message">
                {{ t(notification.messageKey, notification.messageParams ?? {}) }}
            </p>
        </div>
        <button
            v-if="notification.dismissible"
            class="notification-button-dismiss"
            @click="dismissSelf"
            type="button"
            :aria-label="t('accessibility.notification.close')"
        >
            <span aria-hidden="true">×</span>
        </button>
    </div>
</template>

<style lang="scss" scoped>
.notification-card {
    --countdown-height: 5px;

    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: calc(0.5rem + var(--countdown-height));
    color: var(--color-notification-text);
    pointer-events: auto;
    background-color: var(--card-bg);
    border-radius: var(--notification-radius);
    box-shadow: var(--notification-shadow);
}

.notification-card--timed {
    background-image: linear-gradient(var(--card-highlight), var(--card-highlight));
    background-repeat: no-repeat;
    background-position: left bottom;
    background-size: 100% var(--countdown-height);
    animation: bottom-bar-countdown var(--notification-duration) linear forwards;
}

.notification-card--paused {
    animation-play-state: paused;
}

@keyframes bottom-bar-countdown {
    from {
        background-size: 100% var(--countdown-height);
    }

    to {
        background-size: 0% var(--countdown-height);
    }
}

.notification-content {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
}

.notification-title {
    font-weight: bold;
}

.notification-button-dismiss {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    // at least 24x24px, the minimal target size recommended by WCAG
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    border: none;
    border-radius: var(--notification-radius);
    background: transparent;
    // currentColor-based, so the button follows any theme without its own color
    color: inherit;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 150ms;

    &:hover {
        opacity: 1;
    }

    // keyboard focus only, no ring on mouse click
    &:focus-visible {
        opacity: 1;
        outline: 2px solid currentColor;
        outline-offset: 2px;
    }
}

// each type only points the card's local variables to its theme tokens
.notification-error {
    --card-bg: var(--color-notification-error-bg);
    --card-highlight: var(--color-notification-error-highlight);
}

.notification-success {
    --card-bg: var(--color-notification-success-bg);
    --card-highlight: var(--color-notification-success-highlight);
}

.notification-info {
    --card-bg: var(--color-notification-info-bg);
    --card-highlight: var(--color-notification-info-highlight);
}

.notification-warning {
    --card-bg: var(--color-notification-warning-bg);
    --card-highlight: var(--color-notification-warning-highlight);
}
</style>
