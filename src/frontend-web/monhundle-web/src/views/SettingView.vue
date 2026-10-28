<script setup lang="ts">
import { BaseBlockingError } from '@/domain/errors/BlockingError/BaseBlockingError';
import { NotificationTypes } from '@/domain/Notification';
import { isUUID, msUntilMidnightUTC } from '@/domain/Utils';
import { injectStrict, notificationEmitterKey, settingsApiKey } from '@/injectionKeyRegistry';
import { paths } from '@/router';
import { CookieKeys, clearCookies, setCookie, deleteCookie } from '@/services/CookieService';
import { LocalStorageKeys, getStoredUserId } from '@/services/LocalStorageService';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const router = useRouter();
const { t } = useI18n();
const settingsApi = injectStrict(settingsApiKey);
const notificationEmitter = injectStrict(notificationEmitterKey);

const gameList = ref<string[]>([]);
const enableTableA11y = ref<boolean>(false);
let currentUUID: string = '';
const inputUuid = ref<string | null>(null);
const isWorking = ref<boolean>(false);
const uuidErrorKey = ref<string | null>(null);

onMounted(async () => {
    // load game list
    const storedGameList = localStorage.getItem(LocalStorageKeys.GAME_LIST);
    gameList.value = (JSON.parse(storedGameList!) as string[]) ?? [];

    // load current a11y conf
    enableTableA11y.value =
        localStorage.getItem(LocalStorageKeys.TABLE_VISUAL_ACCESSIBILITY)?.toLowerCase() === 'true';

    // get current UUID
    currentUUID = getStoredUserId() ?? '';
});

function toggleA11y() {
    localStorage.setItem(
        LocalStorageKeys.TABLE_VISUAL_ACCESSIBILITY,
        String(enableTableA11y.value),
    );
}

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
            uuidErrorKey.value = 'ui.settings.setUUID.error.format';
            isWorking.value = false;
            return;
        }

        const userProfile = await settingsApi.getProfile(cleanedInput);
        if (!userProfile) {
            console.warn('no profile found for provided identifier');
            notificationEmitter.notify({
                messageKey: 'ui.notification.warning.profileNotFound.message',
                type: NotificationTypes.Warning,
            });
            isWorking.value = false;
            return;
        }
        await settingsApi.loadUser(cleanedInput);

        localStorage.setItem(
            LocalStorageKeys.GAME_LIST,
            JSON.stringify(userProfile.gameList ?? []),
        );
        gameList.value = userProfile.gameList ?? [];

        localStorage.setItem(
            LocalStorageKeys.TABLE_VISUAL_ACCESSIBILITY,
            String(userProfile.enableTableVisualAid || false),
        );
        enableTableA11y.value = userProfile.enableTableVisualAid || false;

        if (userProfile.currentDailyGameUuid) {
            setCookie(
                CookieKeys.CURRENT_DAILY_GAME,
                userProfile.currentDailyGameUuid,
                msUntilMidnightUTC(),
            );
        } else {
            deleteCookie(CookieKeys.CURRENT_DAILY_GAME);
        }

        if (userProfile.currentUnlimitedGameUuid) {
            setCookie(CookieKeys.CURRENT_UNLIMITED_GAME, userProfile.currentUnlimitedGameUuid);
        } else {
            deleteCookie(CookieKeys.CURRENT_UNLIMITED_GAME);
        }

        // loadUser() has swapped the stored identity; reload so the app re-authenticates as the loaded user
        notificationEmitter.notify({
            messageKey: 'ui.notification.success.profileLoaded.message',
            type: NotificationTypes.Success,
        });
        setTimeout(() => location.reload(), 1500);
    } catch (err) {
        isWorking.value = false;
        throw err;
    }
}

function deleteStoredData() {
    isWorking.value = true;
    // delete local storage
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
        await settingsApi.saveSettings(enableTableA11y.value, gameList.value);
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
    if (gameList.value.length < 4) {
        return t('ui.settings.gameList.shortLabel', { gameList: gameList.value.join(', ') });
    } else {
        const displayedList = gameList.value.slice(0, 3);
        return t('ui.settings.gameList.label', {
            gameList: displayedList.join(', '),
            gameCount: gameList.value.length,
        });
    }
}

function onUuidInput() {
    uuidErrorKey.value = null;
}
</script>

<template>
    <div class="setting-list">
        <h2>{{ t('ui.settings.titles.preferences') }}</h2>
        <div class="setting-line">
            <label>{{ t('ui.settings.visualAccessibility.label') }}</label>
            <input
                :disabled="isWorking"
                @change="toggleA11y()"
                v-model="enableTableA11y"
                type="checkbox"
            />
            <span class="setting-description">{{
                t('ui.settings.visualAccessibility.description')
            }}</span>
        </div>
        <div class="setting-line">
            <label> {{ getGameListString() }}</label>
            <button :disabled="isWorking" @click="router.push(paths.selectGame)">
                {{ t('ui.settings.gameList.button') }}
            </button>
            <span class="setting-description">{{ t('ui.settings.gameList.description') }}</span>
        </div>
        <div class="setting-line">
            <label> {{ t('ui.settings.savePreferences.label') }}</label>
            <button :disabled="isWorking" @click="savePreferenceToProfile()">
                {{ t('ui.settings.savePreferences.button') }}
            </button>
            <span class="setting-description">{{
                t('ui.settings.savePreferences.description')
            }}</span>
        </div>
    </div>
    <div class="setting-list">
        <h2>{{ t('ui.settings.titles.data') }}</h2>
        <div class="setting-line">
            <label>{{ t('ui.settings.copyUUID.label') }}</label>
            <button :disabled="isWorking" @click="copyUUID()">
                {{ t('ui.settings.copyUUID.button') }}
            </button>
            <span class="setting-description">{{ t('ui.settings.copyUUID.description') }}</span>
        </div>
        <div class="setting-line">
            <label>{{ t('ui.settings.setUUID.label') }}</label>
            <span class="composed-field">
                <input
                    type="text"
                    v-model="inputUuid"
                    @input="onUuidInput"
                    :placeholder="t('ui.settings.setUUID.placeholder')"
                    :aria-invalid="uuidErrorKey !== null"
                    aria-describedby="uuid-field-error"
                    :class="{ invalid: uuidErrorKey }"
                />
                <button :disabled="isWorking" @click="loadUuid()">
                    {{ t('ui.settings.setUUID.button') }}
                </button>
            </span>
            <span v-if="uuidErrorKey" id="uuid-field-error" class="field-error" role="alert">
                {{ t(uuidErrorKey) }}
            </span>
            <span class="setting-description">{{ t('ui.settings.setUUID.description') }}</span>
        </div>
        <div class="setting-line">
            <label>{{ t('ui.settings.deleteUUID.label') }}</label>
            <button :disabled="isWorking" @click="deleteStoredData()" class="danger">
                {{ t('ui.settings.deleteUUID.button') }}
            </button>
            <span class="setting-description">{{ t('ui.settings.deleteUUID.description') }}</span>
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
            border: 2px solid var(--error-red);
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
            color: var(--error-red);
            border-left: 3px solid var(--error-red);
        }
    }
}
</style>
