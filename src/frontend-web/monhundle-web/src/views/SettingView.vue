<script setup lang="ts">

import { vModelCheckbox } from 'vue';
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

</script>

<template>
    <div class="setting-list">
        <div>
            <label>Enable visual accessibility</label>
            <input type="checkbox"/>
        </div>
        <div>
            <label>gamelist for unlimited play: all (12 titles)</label>
            <button>change game list</button>
        </div>
        <div>
            <label>Get your identifier</label>
            <button>copy your UUID</button>
        </div>
        <div>
            <label>load your identifier</label>
            <input type="text">
            <button>load</button>
        </div>
        <div>
            <button>delete your data</button>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>
