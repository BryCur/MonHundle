<script setup lang="ts">

import { useI18n } from 'vue-i18n'
import LocaleSelector from '../components/LocaleSelector.vue'

const { t, locale } = useI18n()

</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div>{{ $t("ui.welcome") }}</div>
    <LocaleSelector />
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
