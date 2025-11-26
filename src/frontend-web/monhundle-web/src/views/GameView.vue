<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import { getCookie, setCookie } from '../services/CookieService';
import GameGuessList from '../components/game-elements/GameGuessList.vue';
import { useGameStore } from '../stores/GameStore';
import type { GameService } from '../services/GameService';
import type ResourceApi from '../services/ApiService/ResourceApi';
import { GameStates } from '../domain/enums/GameStates';
import MonsterSelectBox from '../components/game-elements/MonsterSelectBox.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const gameStore = useGameStore();
const gameService = inject<GameService>('gameService');
const resourceApi = inject<ResourceApi>('resourceApi');

const isGameOver = computed(() => gameStore.game?.state != GameStates.Ongoing);
const gameGuesses = computed(() => gameStore.isGameNull() ? [] : gameStore.game?.guesses);

let ready = ref(false);
let monsterList = ref<string[]>([]);
let selectedMonster = ref<string | undefined>(undefined);
let gameId :string | undefined; 

onMounted(async () => {
    ready.value = false;
    let gameIdFromCookie = getCookie("currentGame");

    if(gameIdFromCookie && gameStore.isGameNull()){
        await gameService?.resumeGame(gameIdFromCookie).then(async gameSet => {
            if (!gameSet) {
               startNewGame();
            } else {
                gameId = gameStore.game!.gameId
            }
        })
    } else if (gameStore.isGameNull()) {
        startNewGame();
    }

    let gameList = JSON.parse(localStorage.getItem("gameList") ?? "") as string[];
    await resourceApi?.getMonstersOptions(gameList)
        .then(list => monsterList.value = list);
    
    ready.value = true;
}) 

async function sendGuess() {
    // send to api
    gameService?.makeGuess(gameId!, selectedMonster.value!);
    selectedMonster.value = undefined;

    // TODO game finished screen (congrats, right answer, send requests, disabled fields)
    // TODO styling........
}

function startNewGame() {
    gameService?.startNewGame().then(resp => gameId = resp);
}
function getLastGuessIcon(){
    if(gameStore.isGameNull() || gameStore.isGameOngoing()){
        return "/images/monsters/unknown.png";
    } else {
        return `/images/monsters/${gameStore.game!.guesses[gameStore.game!.guesses.length-1]?.monsterCode}.png`;
    }
}

function getLastGuessName(): string{
    if(gameStore.isGameNull() || gameStore.isGameOngoing()){
        return t("game.monsters.unknown.name");
    } else {
        return t(`game.monster.${gameStore.game!.guesses[gameStore.game!.guesses.length-1]?.monsterCode}.name`);
    }
}

</script>

<template>
    <div v-if="ready" class="game-page-container">
        <div class="introduction" v-if="!isGameOver">
            <img class="introduction-icon" src="/images/monsters/unknown.png"></img>
            <div v-html="t('ui.game.rules.unlimited')" class="introduction-content">
            </div>
        </div>
        <div v-if="!isGameOver" class="option-selector-container">
            <MonsterSelectBox :items="monsterList" v-model="selectedMonster"></MonsterSelectBox>
            <button @click="sendGuess()">
                <span>{{ $t("ui.generic.sendguess")}}</span>
            </button>
        </div>
        <div v-else class="option-game-over-container"> 
            <img class="game-over-icon" :src="getLastGuessIcon()"></img>
            <div class="game-over-content">
                <p><b>{{ $t("ui.game.over.congrats") }}</b></p>
                <p> {{ $t("ui.game.over.answer", {monster: getLastGuessName(), attempts: gameStore.game?.guesses.length}) }}</p>
            </div>
            <button @click="startNewGame()">
                <span> {{ $t("ui.generic.newGame") }}</span>
            </button>
        </div>
        <div class="game-progress-container">
            <GameGuessList v-model="gameGuesses"></GameGuessList>
        </div>
    </div>
    <div v-else> loading... </div>
</template>

<style lang="scss" scoped>

.game-page-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;

    .introduction {
        text-align: center;
        font-size: 10pt;
        margin-bottom: 2rem;

        .introduction-icon {
            height: 124px;
            width: 124px;
        }

        .introduction-content > * {
            margin-bottom: .5rem;
        }
    }

    .option-selector-container, .game-progress-container {
        display: flex;
        justify-content: center;
        gap:1rem;
    }

    .game-progress-container {
        display: flex;
        flex-direction: column;
    }

    .option-game-over-container{
        text-align: center;
        font-size: 10pt;
        
        .game-over-icon {
            height: 124px;
            width: 124px;
        }

        .game-over-content > * {
            margin-bottom: .5rem;
        }
    }
}

</style>