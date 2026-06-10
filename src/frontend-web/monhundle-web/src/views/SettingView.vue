<script setup lang="ts">

import { isUUID, msUntilMidnightUTC } from '@/domain/Utils';
import { paths, router } from '@/router';
import { SettingsApi } from '@/services/ApiService/SettingApi';
import { CookieKeys, getCookie, clearCookies, setCookie } from '@/services/CookieService';
import { LocalStorageKeys } from '@/services/LocalStorageService';
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const settingsApi = inject<SettingsApi>('settingsApi');

let gameList: string[] = [];
const enableTableA11y = ref<boolean>(false);
let currentUUID: string = "";
const inputUuid = ref<string |null>(null)

onMounted(async () => { 
    // load game list
    const storedGameList = localStorage.getItem(LocalStorageKeys.GAME_LIST);
    gameList = JSON.parse(storedGameList!) as string[];

    // load current a11y conf
    enableTableA11y.value = Boolean(localStorage.getItem(LocalStorageKeys.TABLE_VISUAL_ACCESSIBILITY) ?? false);

    // get current UUID
    currentUUID = getCookie(CookieKeys.USER_ID) ?? "";

})

function  toggleA11y() {
    localStorage.setItem(LocalStorageKeys.TABLE_VISUAL_ACCESSIBILITY, String(enableTableA11y.value))
}

function copyUUID() {
    navigator.clipboard.writeText(currentUUID);
}

async function loadUuid() {

    if(inputUuid.value && isUUID(inputUuid.value)) {
        const isInputValid: boolean = await settingsApi?.validateUser(inputUuid.value) ?? false;

        if(isInputValid) {
            await settingsApi?.loadUser(inputUuid.value);
            const userProfile = await settingsApi?.getProfile(inputUuid.value);

            localStorage.setItem(LocalStorageKeys.GAME_LIST, userProfile?.gameList || "");
            localStorage.setItem(LocalStorageKeys.TABLE_VISUAL_ACCESSIBILITY, String(userProfile?.enableTableVisualAid ||false));

            if(userProfile?.currentDailyGameUuid){
                setCookie(CookieKeys.CURRENT_DAILY_GAME, userProfile?.currentDailyGameUuid, msUntilMidnightUTC());
            }

            if(userProfile?.currentUnlimitedGameUuid){
                setCookie(CookieKeys.CURRENT_UNLIMITED_GAME, userProfile?.currentUnlimitedGameUuid);
            }
        } else {
            // TODO error management
            console.error("UUID provided not recognised")
        }
    } else {
        console.error("invalid format")
    }
}

function deleteStoredData() {
    // delete local storage
    localStorage.clear()
    clearCookies();

    location.reload();
}

async function savePreferenceToProfile() {
    await settingsApi?.saveSettings(enableTableA11y.value, gameList);
}

function getGameListString() {
    if(gameList.length < 4) {
        return t('ui.settings.gameList.shortLabel', {gameList: gameList.join(', ')});
    } else {
        const displayedList = gameList.slice(0, 3);
        return t('ui.settings.gameList.label', {gameList: displayedList.join(', '), gameCount: gameList.length});
    }
}
</script>

<template>
    <div class="setting-list">
        <h2>{{ $t('ui.settings.titles.preferences')}}</h2>
        <div class="setting-line">
            <label>{{ $t('ui.settings.visualAccessibility.label')}}</label>
            <input @change="toggleA11y()" v-model="enableTableA11y" type="checkbox"/>
            <span class="setting-description">{{ $t('ui.settings.visualAccessibility.description') }}</span>
        </div>
        <div class="setting-line">
            <label> {{ getGameListString() }}</label>
            <button @click="router.push(paths.selectGame)"> {{ $t('ui.settings.gameList.button') }}</button>
            <span class="setting-description">{{ $t('ui.settings.gameList.description') }}</span>
        </div>
        <div class="setting-line">
            <label> {{ $t('ui.settings.savePreferences.label') }}</label>
            <button @click="savePreferenceToProfile()">{{ $t('ui.settings.savePreferences.button') }}</button>
            <span class="setting-description">{{ $t('ui.settings.savePreferences.description') }}</span>
        </div>
    </div>
    <div class="setting-list">
        <h2>{{ $t('ui.settings.titles.data')}}</h2>
        <div class="setting-line">
            <label>{{ $t('ui.settings.copyUUID.label')}}</label>
            <button @click="copyUUID()">{{ $t('ui.settings.copyUUID.button')}}</button>
            <span class="setting-description">{{ $t('ui.settings.copyUUID.description') }}</span>
            
        </div>
        <div class="setting-line">
            <label>{{ $t('ui.settings.setUUID.label')}}</label>
            <span class="composed-field">
                <input type="text" v-model="inputUuid" :placeholder="t('ui.settings.setUUID.placeholder')">
                <button @click="loadUuid()">{{ $t('ui.settings.setUUID.button') }}</button>
            </span>
            <span class="setting-description">{{ $t('ui.settings.setUUID.description') }}</span>
        </div>
        <div class="setting-line">
            <label>{{ $t('ui.settings.deleteUUID.label')}}</label>
            <button @click="deleteStoredData()" class="danger">{{ $t('ui.settings.deleteUUID.button')}}</button>
            <span class="setting-description">{{ $t('ui.settings.deleteUUID.description') }}</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>

.setting-list {
    min-width: 25vw;
    width: 40vw;
    display:flex;
    flex-direction: column;
    margin-bottom: 5vh;

    h2 {
        font-weight: bold;
        margin-bottom: 1vh;
    }

    .setting-line {
        display:grid;
        grid-template-columns: repeat(2, minmax(250px, 50%));
        gap: 0 1rem;
        margin-bottom: 3vh;
        font-size: 1.1rem;


        .composed-field {
            display:flex;
            gap: 1vw;

            input {
                width: 75%
            }

            button {
                min-width: 5vw;
                width: 25%
            }
        }

        .setting-description { 
            grid-column: span 2;
            font-size: .9rem;
            font-style: italic;
        }
    }
}
</style>
