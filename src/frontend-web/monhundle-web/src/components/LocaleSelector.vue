<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { locale, availableLocales } = useI18n();
</script>

<template>
    <div>
        <select v-model="locale">
            <option v-for="lang in availableLocales" :key="lang" :value="lang">{{ lang }}</option>
        </select>
    </div>
</template>

<style scoped></style>
