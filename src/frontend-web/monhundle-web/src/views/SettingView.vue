<script setup lang="ts">
import LocaleSelector from '@/components/LocaleSelector.vue';
import ThemeSelector from '@/components/ThemeSelector.vue';
import { BaseBlockingError } from '@/domain/errors/BlockingError/BaseBlockingError';
import { LoadFailedError } from '@/domain/errors/NotifiedError/LoadFailedError';
import { NotificationTypes } from '@/domain/Notification';
import { THEME_IDS } from '@/domain/Theme';
import { isUUID } from '@/domain/Utils';
import { injectStrict, notificationEmitterKey, settingsServiceKey } from '@/injectionKeyRegistry';
import { paths } from '@/router';
import { clearCookies } from '@/services/CookieService';
import { getStoredUserId } from '@/services/LocalStorageService';
import { useSettingsStore } from '@/stores/SettingsStore';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteLeave, useRouter } from 'vue-router';

const router = useRouter();
const { t } = useI18n();
const settingsStore = useSettingsStore();
const settingsService = injectStrict(settingsServiceKey);
const notificationEmitter = injectStrict(notificationEmitterKey);

const enableTableA11y = computed({
    get: () => settingsStore.tableVisualAid,
    set: (enable) => settingsService.setTableVisualAid(enable),
});

let currentUUID: string;
const inputUuid = ref<string | null>(null);
const isWorking = ref<boolean>(false);
const uuidErrorKey = ref<string | null>(null);

let savedSnapshot = JSON.stringify(settingsStore.$state);

onMounted(async () => {
    // get current UUID
    const storedId: string | null = getStoredUserId();
    if (!storedId) {
        router.replace(paths.home);
    } else {
        currentUUID = storedId;
    }
});

onBeforeRouteLeave(() => {
    if (savedSnapshot !== JSON.stringify(settingsStore.$state)) {
        settingsService.saveToProfile().catch((err) => console.error(err));
    }
});

async function copyUUID() {
    try {
        await navigator.clipboard.writeText(currentUUID);
    } catch (err) {
        console.warn('[copy uuid] could not write to the clipboard', err);
        notificationEmitter.notify({
            type: NotificationTypes.Error,
            messageKey: 'ui.notification.error.uuidCopyFailed.message',
        });
        return;
    }

    notificationEmitter.notify({
        messageKey: 'ui.notification.info.uuidCopied.message',
        type: NotificationTypes.Info,
    });
}

async function loadUuid() {
    isWorking.value = true;
    try {
        const cleanedInput = inputUuid.value?.trim() ?? null;
        if (cleanedInput === null || !isUUID(cleanedInput)) {
            console.warn('invalid uuid format');
            uuidErrorKey.value = 'ui.page.settings.setUUID.error.format';
            isWorking.value = false;
            return;
        }

        await settingsService.loadProfile(cleanedInput);
        savedSnapshot = JSON.stringify(settingsStore.$state);

        // loadUser() has swapped the stored identity; reload so the app re-authenticates as the loaded user
        notificationEmitter.notify({
            messageKey: 'ui.notification.success.profileLoaded.message',
            type: NotificationTypes.Success,
        });
        setTimeout(() => location.reload(), 1500);
    } catch (err) {
        if (err instanceof LoadFailedError) {
            console.warn('no profile found for provided identifier');
            notificationEmitter.notify({
                messageKey: 'ui.notification.warning.profileNotFound.message',
                type: NotificationTypes.Warning,
            });

            isWorking.value = false;
            return;
        }

        isWorking.value = false;
        throw err;
    }
}

function deleteStoredData() {
    isWorking.value = true;
    // delete local storage
    settingsService.resetSettings();
    localStorage.clear();
    clearCookies();

    notificationEmitter.notify({
        messageKey: 'ui.notification.success.dataDeleted.message',
        type: NotificationTypes.Success,
    });
    setTimeout(() => location.reload(), 1500);
}

async function savePreferenceToProfile() {
    isWorking.value = true;
    try {
        await settingsService.saveToProfile();
        savedSnapshot = JSON.stringify(settingsStore.$state);
        notificationEmitter.notify({
            messageKey: 'ui.notification.success.savedSettings.message',
            type: NotificationTypes.Success,
        });
    } catch (err) {
        console.warn('failed to back up preferences');
        if (err instanceof BaseBlockingError) {
            // needs to be redirected to error page
            throw err;
        }

        notificationEmitter.notify({
            type: NotificationTypes.Error,
            messageKey: 'ui.notification.error.saveSettingsFailed.message',
        });
    } finally {
        isWorking.value = false;
    }
}

function getGameListString() {
    if (!settingsStore.gameList || settingsStore.gameList.length < 4) {
        return t('ui.page.settings.gameList.shortLabel', {
            gameList: settingsStore.gameList?.join(', ') ?? '',
        });
    } else {
        const displayedList = settingsStore.gameList.slice(0, 3);
        return t('ui.page.settings.gameList.label', {
            gameList: displayedList.join(', '),
            gameCount: settingsStore.gameList.length,
        });
    }
}

function onUuidInput() {
    uuidErrorKey.value = null;
}
</script>

<template>
    <div class="setting-list">
        <h2>{{ t('ui.page.settings.titles.preferences') }}</h2>
        <div class="setting-line">
            <label for="language-select">{{ t('ui.page.settings.language.label') }}</label>
            <LocaleSelector id="language-select" :disabled="isWorking"></LocaleSelector>
            <span class="setting-description">{{
                t('ui.page.settings.language.description')
            }}</span>
        </div>
        <!-- hidden while there is nothing to choose from; shows up with the second theme -->
        <div v-if="THEME_IDS.length > 1" class="setting-line">
            <label for="theme-select">{{ t('ui.page.settings.theme.label') }}</label>
            <ThemeSelector id="theme-select" :disabled="isWorking"></ThemeSelector>
            <span class="setting-description">{{ t('ui.page.settings.theme.description') }}</span>
        </div>
        <div class="setting-line">
            <label>{{ t('ui.page.settings.visualAccessibility.label') }}</label>
            <input :disabled="isWorking" v-model="enableTableA11y" type="checkbox" />
            <span class="setting-description">{{
                t('ui.page.settings.visualAccessibility.description')
            }}</span>
        </div>
        <div class="setting-line">
            <label> {{ getGameListString() }}</label>
            <button :disabled="isWorking" @click="router.push(paths.selectGame)">
                {{ t('ui.page.settings.gameList.button') }}
            </button>
            <span class="setting-description">{{
                t('ui.page.settings.gameList.description')
            }}</span>
        </div>
        <div class="setting-line">
            <label> {{ t('ui.page.settings.savePreferences.label') }}</label>
            <button :disabled="isWorking" @click="savePreferenceToProfile()">
                {{ t('ui.page.settings.savePreferences.button') }}
            </button>
            <span class="setting-description">{{
                t('ui.page.settings.savePreferences.description')
            }}</span>
        </div>
    </div>
    <div class="setting-list">
        <h2>{{ t('ui.page.settings.titles.data') }}</h2>
        <div class="setting-line">
            <label>{{ t('ui.page.settings.copyUUID.label') }}</label>
            <button :disabled="isWorking" @click="copyUUID()">
                {{ t('ui.page.settings.copyUUID.button') }}
            </button>
            <span class="setting-description">{{
                t('ui.page.settings.copyUUID.description')
            }}</span>
        </div>
        <div class="setting-line">
            <label>{{ t('ui.page.settings.setUUID.label') }}</label>
            <span class="composed-field">
                <input
                    type="text"
                    v-model="inputUuid"
                    @input="onUuidInput"
                    :placeholder="t('ui.page.settings.setUUID.placeholder')"
                    :aria-invalid="uuidErrorKey !== null"
                    aria-describedby="uuid-field-error"
                    :class="{ invalid: uuidErrorKey }"
                />
                <button :disabled="isWorking" @click="loadUuid()">
                    {{ t('ui.page.settings.setUUID.button') }}
                </button>
            </span>
            <span v-if="uuidErrorKey" id="uuid-field-error" class="field-error" role="alert">
                {{ t(uuidErrorKey) }}
            </span>
            <span class="setting-description">{{ t('ui.page.settings.setUUID.description') }}</span>
        </div>
        <div class="setting-line">
            <label>{{ t('ui.page.settings.deleteUUID.label') }}</label>
            <button :disabled="isWorking" @click="deleteStoredData()" class="danger">
                {{ t('ui.page.settings.deleteUUID.button') }}
            </button>
            <span class="setting-description">{{
                t('ui.page.settings.deleteUUID.description')
            }}</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.setting-list {
    min-width: 25vw;
    width: 40vw;
    display: flex;
    flex-direction: column;
    margin-bottom: 5vh;

    h2 {
        font-weight: bold;
        margin-bottom: 1vh;
    }

    .setting-line {
        display: grid;
        grid-template-columns: repeat(2, minmax(250px, 50%));
        gap: 0 1rem;
        margin-bottom: 3vh;
        font-size: 1.1rem;

        .composed-field {
            display: flex;
            gap: 1vw;

            input {
                width: 75%;
            }

            button {
                min-width: 5vw;
                width: 25%;
            }
        }

        .invalid {
            border: 2px solid var(--color-error);
        }

        .setting-description {
            grid-column: span 2;
            font-size: 0.9rem;
            font-style: italic;
        }

        .field-error {
            grid-column: span 2;
            font-size: 0.9rem;
            padding: 0 1rem;
            color: var(--color-error);
            border-left: 3px solid var(--color-error);
        }
    }
}
</style>
