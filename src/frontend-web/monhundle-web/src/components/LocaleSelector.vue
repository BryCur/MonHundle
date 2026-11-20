<script setup lang="ts">
import { LOCALE_NATIVE_NAMES, SUPPORTED_LOCALES } from '@/domain/Settings';
import { injectStrict, settingsServiceKey } from '@/injectionKeyRegistry';
import { computed } from 'vue';

const settingsService = injectStrict(settingsServiceKey);

const currentLanguage = computed({
    get: () => settingsService.getCurrentLanguage(),
    set: (lang) => settingsService.setLanguage(lang),
});
</script>

<template>
    <select v-model="currentLanguage">
        <option v-for="lang in SUPPORTED_LOCALES" :key="lang" :value="lang" :lang="lang">
            {{ LOCALE_NATIVE_NAMES[lang] }}
        </option>
    </select>
</template>
