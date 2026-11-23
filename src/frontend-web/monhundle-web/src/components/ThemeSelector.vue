<script setup lang="ts">
import { THEME_IDS } from '@/domain/Theme';
import { injectStrict, settingsServiceKey } from '@/injectionKeyRegistry';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const settingsService = injectStrict(settingsServiceKey);

const currentTheme = computed({
    get: () => settingsService.getCurrentTheme(),
    set: (theme) => settingsService.setTheme(theme),
});
</script>

<template>
    <!-- the select is the root element: attributes given to the component (id, disabled) land on it -->
    <select v-model="currentTheme">
        <!-- unlike the language names, the theme names are shown in the interface language -->
        <option v-for="theme in THEME_IDS" :key="theme" :value="theme">
            {{ t(`ui.theme.${theme}`) }}
        </option>
    </select>
</template>
