<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
    <div class="about">
        <h1>{{ t('ui.page.about.title') }}</h1>
        <p>{{ t('ui.page.about.disclaimer') }}</p>
        <i18n-t keypath="ui.page.about.copyright" tag="p" scope="global">
            <template #game><i>Monster Hunter</i></template>
            <template #contact>
                <a href="https://www.linkedin.com/in/bryan-curchod/">LinkedIn</a>
            </template>
        </i18n-t>
        <i18n-t keypath="ui.page.about.credits" tag="p" scope="global">
            <template #contacts>
                <a href="https://ko-fi.com/gaudium017" target="_blank">kofi</a>,
                <a href="https://x.com/Gaudium017" target="_blank">X/twitter</a>
            </template>
        </i18n-t>
    </div>
</template>

<style lang="scss" scoped>
.about {
    display: flex;
    flex-direction: column;
    align-items: center;

    p {
        text-align: center;
        padding: 0.3rem;
    }
}
</style>
