<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { CookieKeys, getCookie } from '@/services/CookieService';
import GameGuessList from '@/components/game-elements/GameGuessList.vue';
import { useGameStore } from '@/stores/GameStore';
import MonsterSelectBox from '@/components/game-elements/MonsterSelectBox.vue';
import { useI18n } from 'vue-i18n';
import { getLatestIconForMonster } from '@/services/MonsterIconService';
import { LocalStorageKeys } from '@/services/LocalStorageService';
import { dailyGameServiceKey, injectStrict, resourceServiceKey } from '@/injectionKeyRegistry';

const { t } = useI18n();
const gameStore = useGameStore();
const gameService = injectStrict(dailyGameServiceKey);
const resourceService = injectStrict(resourceServiceKey);

const ready = ref(false);
const monsterList = ref<string[]>([]);
const selectedMonster = ref<string | undefined>(undefined);
let enableTableA11y = false;

onMounted(async () => {
    ready.value = false;

    enableTableA11y =
        localStorage.getItem(LocalStorageKeys.TABLE_VISUAL_ACCESSIBILITY)?.toLowerCase() === 'true';
    const gameIdFromCookie = getCookie(CookieKeys.CURRENT_DAILY_GAME);

    if (
        !gameIdFromCookie || // no cookie existing
        !(await gameService.resumeGame(gameIdFromCookie)) // game from cookie couldn't be set
    ) {
        await gameService.startNewGame();
    }

    monsterList.value = await resourceService.getMonsterOptions();

    ready.value = true;
});

async function sendGuess() {
    gameService.makeGuess(selectedMonster.value!);
    selectedMonster.value = undefined;
}

function getLastGuessIcon() {
    if (gameStore.isGameNull || gameStore.isGameOngoing) {
        return getLatestIconForMonster('unknown');
    } else {
        return getLatestIconForMonster(gameStore.lastGuess?.monsterCode);
    }
}

function getLastGuessName(): string {
    if (gameStore.isGameNull || gameStore.isGameOngoing) {
        return t('game.monster.unknown.name');
    } else {
        return t(`game.monster.${gameStore.lastGuess?.monsterCode ?? 'unknown'}.name`);
    }
}

// insert string representation of the game into the clipboard
function shareGame(): void {
    const guessCount = gameStore.guesses.length;
    const guessesStr = gameStore.game?.convertGameToShareableString();
    const Url = 'https://' + window.location.host + window.location.pathname;

    const shareStr = t('ui.game.share.daily', { guessCount, guessesStr, Url });

    navigator.clipboard.writeText(shareStr);
}
</script>

<template>
    <div v-if="ready" class="game-page-container">
        <div class="introduction fit-screen" v-if="!gameStore.isGameOver">
            <img class="introduction-icon" :src="getLatestIconForMonster('unknown')" />
            <div v-html="t('ui.game.rules.unlimited')" class="introduction-content"></div>
        </div>
        <div v-if="!gameStore.isGameOver" class="option-selector-container fit-screen">
            <MonsterSelectBox :items="monsterList" v-model="selectedMonster"></MonsterSelectBox>
            <button @click="sendGuess()">
                <span>{{ t('ui.generic.sendguess') }}</span>
            </button>
        </div>
        <div v-else class="option-game-over-container">
            <img class="game-over-icon" :src="getLastGuessIcon()" />
            <div class="game-over-content">
                <p>
                    <b>{{ t('ui.game.over.congrats') }}</b>
                </p>
                <p>
                    {{
                        t('ui.game.over.answer', {
                            monster: getLastGuessName(),
                            attempts: gameStore.guesses.length,
                        })
                    }}
                </p>
            </div>
            <button @click="shareGame()">
                <span> {{ t('ui.generic.share') }}</span>
            </button>
        </div>
        <div class="game-progress-container fit-screen">
            <GameGuessList
                v-model="gameStore.guesses"
                :accessibility-enabled="enableTableA11y"
            ></GameGuessList>
        </div>
    </div>
    <div v-else>loading...</div>
</template>

<style lang="scss" scoped>
.game-page-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .introduction {
        text-align: center;
        margin-bottom: 2rem;
        font-size: 0.8rem;
        display: flex;
        align-content: center;
        justify-content: center;
        gap: 2rem;

        .introduction-icon {
            height: 6rem;
            width: 6rem;
        }

        .introduction-content {
            display: flex;
            flex-direction: column;
            justify-content: space-around;

            p {
                margin-bottom: 0.5rem;
            }
        }
    }

    .option-selector-container,
    .game-progress-container {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }

    .game-progress-container {
        display: flex;
        flex-direction: column;
    }

    .option-game-over-container {
        text-align: center;

        .game-over-icon {
            height: 8rem;
            width: 8rem;
        }

        .game-over-content > * {
            margin-bottom: 0.5rem;
        }
    }
}

@media (min-width: 1024px) {
    .game-page-container {
        .introduction {
            text-align: center;
            margin-bottom: 2rem;
            font-size: 0.8rem;

            .introduction-icon {
                height: 8rem;
                width: 8rem;
            }

            .introduction-content > * {
                margin-bottom: 0.5rem;
            }
        }
    }
}
</style>
