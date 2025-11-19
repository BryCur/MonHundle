<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import { apiFetch } from '../services/ApiService/ApiBaseAccess';
import { getCookie, setCookie } from '../services/CookieService';
import MonsterSelector from '../components/game-elements/MonsterSelector.vue';
import GameGuessList from '../components/game-elements/GameGuessList.vue';
import { useGameStore } from '../stores/GameStore';
import type { GameService } from '../services/GameService';
import type ResourceApi from '../services/ApiService/ResourceApi';
import { GameStates } from '../domain/enums/GameStates';

const gameStore = useGameStore();
const gameService = inject<GameService>('gameService');
const resourceApi = inject<ResourceApi>('resourceApi');

const isGameOver = computed(() => gameStore.game?.state != GameStates.Ongoing);

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

</script>

<template>
    <div v-if="ready">
        <div v-if="!isGameOver">
            <MonsterSelector :items="monsterList" v-model="selectedMonster"></MonsterSelector>
            <button @click="sendGuess()">
                <span>{{ $t("ui.generic.sendGuess")}}</span>
            </button>
        </div>
        <div v-else> yeeee you got it!</div>
        <div>
            <GameGuessList></GameGuessList>
        </div>
        <div v-if="isGameOver">
            <button @click="startNewGame()">
                <span> {{ $t("ui.generic.newGame") }}</span>
            </button>
        </div>
    </div>
    <div v-else> loading... </div>
</template>