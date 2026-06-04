<script setup lang="ts">

import { paths } from '@/router';
import { CookieKeys, getCookie, clearCookies } from '@/services/CookieService';
import { LocalStorageKeys } from '@/services/LocalStorageService';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

let gameList: string[] = [];
let enableTableA11y = ref<boolean>(false);
let currentUUID: string = "";
const inputUuid = ref<string |null>(null)

onMounted(async () => { 
    // load game list
    let storedGameList = localStorage.getItem(LocalStorageKeys.GAME_LIST);
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

function loadUuid() {
    // check that the uuid exists -> request to BE
    // delete stored data from other 
    // load data from the new? -> request to BE
}

function deleteStoredData() {
    // delete local storage
    localStorage.clear()
    clearCookies();

    location.reload();
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
        <div>
            <label>Get your identifier</label>
            <button @click="copyUUID()">copy your UUID</button>
        </div>
        <div>
            <label>load your identifier</label>
            <input type="text" :value="inputUuid">
            <button>load</button>
        </div>
        <div>
            <button @click="deleteStoredData()">delete your data</button>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>
