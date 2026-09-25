<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const langs = useI18n().availableLocales;
const selectedLang = ref(locale.value);

function switchLang(event: Event) {
    locale.value = (event.target as HTMLSelectElement).value;
}
</script>

<template>
    <div>
        <select @change="switchLang($event)" v-model="selectedLang">
            <option v-for="lang in langs" :key="lang" :value="lang">{{ lang }}</option>
        </select>
    </div>
</template>

<style scoped></style>
