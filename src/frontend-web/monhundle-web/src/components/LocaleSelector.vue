<script setup lang="ts" >
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const langs = useI18n().availableLocales;
let selectedLang = locale.value;

function switchLang(event: any) {
  locale.value = event.target.value;
}
</script>

<template>
  <div>
    <select @change="switchLang($event)" v-model="selectedLang">
      <option v-for="lang in langs" :value="lang">{{ lang }}</option>
    </select>
  </div>
</template>

<style scoped>
</style>