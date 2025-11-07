<script setup lang="ts">
import type { Ref } from 'vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
    items: string[]
}>()

const model = defineModel<string>()

function getMonsterImage(monsterCode: string) {
    return `/images/monster/${monsterCode}.png`
}

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void
}>()
</script>

<template>
    <div class="monster-selector-container">
        <select 
            class="monster-selector-box" 
            v-model="model"
            :placeholder="t('ui.placeholder.monsterSelector')"
        >
            <option v-for="monsterCode in items" class="select-box-option" :value="monsterCode">
                <img :src="getMonsterImage(monsterCode)" class="select-box-option-icon"></img>
                <span>{{  $t("game.monster.name." + monsterCode) }}</span>
            </option>
        </select>
    </div>
</template>

<style lang="css" scoped>

    .monster-select-container{
        width: 100%;
        display: flex;
        align-content: center;
        margin: 1em;
    }
</style>