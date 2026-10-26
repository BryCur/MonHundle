<script setup lang="ts">
import { ErrorReason } from '@/domain/errors/BlockingError/BaseBlockingError';
import { NotificationTypes } from '@/domain/Notification';
import { injectStrict, notificationEmitterKey, serviceStatusApiKey } from '@/injectionKeyRegistry';
import { paths } from '@/router';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router';

const { t } = useI18n();
const router = useRouter();
const currentRoute = useRoute();
const serviceStatusApi = injectStrict(serviceStatusApiKey);
const notificationEmitter = injectStrict(notificationEmitterKey);

const reason = computed<ErrorReason>(() => {
    const rawReason = firstQueryValue(currentRoute.query.reason);
    return Object.values(ErrorReason).includes(rawReason as ErrorReason)
        ? (rawReason as ErrorReason)
        : ErrorReason.Unexpected;
});

const retryPath = computed<string | undefined>(() => {
    const rawFrom = firstQueryValue(currentRoute.query.from);

    if (!rawFrom || !rawFrom.startsWith('/') || rawFrom.startsWith('//')) {
        return undefined;
    }

    const target = router.resolve(rawFrom);

    // unknown route, or the error page itself (retrying it would loop)
    if (target.matched.length === 0 || target.path === paths.error) {
        return undefined;
    }

    return target.fullPath;
});

function firstQueryValue(
    value: LocationQueryValue | LocationQueryValue[] | undefined,
): string | undefined {
    const first = Array.isArray(value) ? value[0] : value;
    return first ?? undefined;
}

async function performRetry(): Promise<void> {
    if (!retryPath.value) {
        return;
    }

    if (reason.value === ErrorReason.Unavailable && !(await serviceStatusApi.isServerAvailable())) {
        notificationEmitter.notify({
            type: NotificationTypes.Warning,
            messageKey: 'ui.notification.warning.serverStillUnavailable.message',
        });
        return; // still down: stay on the page
    }

    router.replace(retryPath.value);
}
</script>

<template>
    <div class="error-content-container">
        <!-- ideally an image would eventually be presented here -->
        <p class="error-content-title">{{ t(`ui.page.error.content.${reason}.title`) }}</p>
        <p class="error-content-message">{{ t(`ui.page.error.content.${reason}.message`) }}</p>
        <div class="buttons-container">
            <button v-if="retryPath" @click="performRetry()">
                {{ t('ui.page.error.action.retry') }}
            </button>

            <button @click="router.replace(paths.home)">
                {{ t('ui.page.error.action.home') }}
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.error-content-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1em;

    width: 100%;

    min-height: 70vh; // centred in the viewport, whatever the parents' heights
    height: 100%;

    .error-content-title {
        font-size: 2rem;
    }

    .error-content-message {
        font-size: 0.9rem;
    }

    .buttons-container {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        width: 100%;

        button {
            padding: 0.3rem 1rem;
        }
    }
}
</style>
