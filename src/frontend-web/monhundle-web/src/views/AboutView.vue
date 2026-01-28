<script setup lang="ts">

import { useI18n } from 'vue-i18n'
import LocaleSelector from '../components/LocaleSelector.vue'

const { t, locale } = useI18n()

</script>

<template>
  <div class="about">
    <h1>About</h1>
    <p>This web application is an unofficial fan project developed and maintained by Bryan "Corbac" Curchod. The developer is in not affiliated, sponsored or approved by Capcom and its affiliates</p>
    <p><i>Monster Hunter</i>, its related names, icons and logos are the property of Capcom Co., Ltd. If Capcom or right owners wants content on this website to be removed or changed, they can reach out to me on <a href="https://www.linkedin.com/in/bryan-curchod/">LinkedIn</a>. </p>
    <p>Monster icons are from Gaudium (<a href="https://ko-fi.com/gaudium017" target="_blank">kofi</a>, <a href="https://x.com/Gaudium017" target="_blank">X/twitter</a>)</p>
  </div>
</template>

<style lang="scss" scoped>
.about {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  p {
    text-align: center;
    padding: .3rem;
  }
}
</style>
