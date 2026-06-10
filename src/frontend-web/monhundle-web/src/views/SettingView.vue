<script setup lang="ts">

import { isUUID, msUntilMidnightUTC } from '@/domain/Utils';
import { paths } from '@/router';
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
</script>

<template>
    <div class="setting-list">
        <div>
            <label>Enable visual accessibility</label>
            <input @change="toggleA11y()" v-model="enableTableA11y" type="checkbox"/>
        </div>
        <div>
            <label>gamelist for unlimited play: all (12 titles)</label>
            <RouterLink :to="paths.selectGame"><button>change game list</button></RouterLink>
        </div>
        <div class="setting-line">
            <label>save preferences</label>
            <button @click="savePreferenceToProfile()">Save</button>
        </div>
        <div class="setting-line">
            <label>Get your identifier</label>
            <button @click="copyUUID()">copy your UUID</button>
        </div>
        <div>
            <label>load your identifier</label>
            <input type="text" v-model="inputUuid">
            <button @click="loadUuid()">load</button>
        </div>
        <div>
            <button @click="deleteStoredData()">delete your data</button>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>
