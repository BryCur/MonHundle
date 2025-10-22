<script setup lang="ts">

import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

function switchLang() {
  locale.value = locale.value === 'en' ? 'fr' : 'en'
}
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div>{{ $t("ui.welcome") }}</div>
    <div>
      <button @click="switchLang">{{ $t("ui.generic.save") }}</button>
    </div>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
