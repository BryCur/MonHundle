<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router';
import LocaleSelector from '@/components/LocaleSelector.vue';
import { paths } from '@/router';
import NotificationCanvas from '@/components/Notification/NotificationCanvas.vue';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();
</script>

<template>
    <NotificationCanvas />
    <header v-if="!route.meta.bare">
        <div class="wrapper">
            <nav class="navigation">
                <RouterLink :to="paths.unlimited">{{ t('ui.navigation.unlimited') }}</RouterLink>
                <RouterLink :to="paths.daily">{{ t('ui.navigation.daily') }}</RouterLink>
                <RouterLink :to="paths.about">{{ t('ui.navigation.about') }}</RouterLink>
                <RouterLink :to="paths.settings">{{ t('ui.navigation.settings') }}</RouterLink>
            </nav>
            <div class="lang-select">
                <LocaleSelector></LocaleSelector>
            </div>
        </div>
    </header>

    <div class="game-area">
        <RouterView />
    </div>
    <footer>
        <div class="footer-disclaimer">
            {{ t('ui.footer.disclaimer') }}
        </div>

        <div class="footer-main">
            <i18n-t keypath="ui.footer.madeBy" tag="span">
                <template #author><a href="https://github.com/BryCur">Corbac</a></template>
            </i18n-t>
        </div>

        <div class="game-version">
            <span>v0.1 prototype</span>
        </div>
    </footer>
</template>

<style lang="scss" scoped>
header {
    line-height: 1.5;
    max-height: 100vh;
    padding: 0 1rem;
    margin-bottom: 2rem;

    .wrapper {
        display: flex;
        place-items: flex-start;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        nav {
            text-align: center;

            a {
                display: inline-block;
                padding: 0 1rem;
                border-left: 1px solid var(--color-border);

                &:first-of-type {
                    border: 0;
                }

                .router-link-exact-active {
                    color: var(--color-text);

                    &:hover {
                        background-color: transparent;
                    }
                }
            }
        }

        .lang-select {
            display: none;
            align-self: flex-end;
        }
    }
}

.game-area {
    margin: auto;
    flex: 1;
}

footer {
    margin-top: 5rem;
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;

    .game-version,
    .footer-disclaimer {
        flex: 0;
        min-width: 150px;
    }

    .footer-main {
        flex: 1;
        max-width: 40vw;
        text-align: center;
    }
    .game-version {
        text-align: right;
    }
}

@media (min-width: 1024px) {
    header {
        display: flex;
        place-items: center;
        margin-bottom: 4rem;
    }

    .logo {
        margin: 0 2rem 0 0;
    }

    nav {
        font-size: 0.8rem;
        text-align: left;
    }
}
</style>
