<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import { apiFetch } from '../services/ApiService/ApiBaseAccess';
import { setCookie } from '../services/CookieService';
import MonsterSelector from '../components/game-elements/MonsterSelector.vue';
import GameGuessList from '../components/game-elements/GameGuessList.vue';
import { useGameStore } from '../stores/GameStore';
import GameStatus from '../domain/GameStatus';
import Guess from '../domain/Guess';
import type { GameService } from '../services/GameService';
import type ResourceApi from '../services/ApiService/ResourceApi';
import { GameStates } from '../domain/enums/GameStates';

const gameStore = useGameStore();
const gameService = inject<GameService>('gameService');
const resourceApi = inject<ResourceApi>('resourceApi');

const isGameOver = computed(() => gameStore.game?.state != GameStates.Ongoing);

let ready = ref(false);
let monsterList = ref<string[]>([])
let selectedMonster = ref<string | undefined>(undefined);
let gameId :string; 

onMounted(async () => {
    ready.value = false;
    await gameService?.startNewGame()
        .then(resp => gameId = resp);
    setCookie("currentGame", gameId);

    let gameList = JSON.parse(localStorage.getItem("gameList") ?? "") as string[];
    await resourceApi?.getMonstersOptions(gameList)
        .then(list => monsterList.value = list);
    
    ready.value = true;
}) 

async function sendGuess() {
    // send to api
    gameService?.makeGuess(gameId, selectedMonster.value!);
    selectedMonster.value = undefined;

    // TODO game finished screen (congrats, right answer, send requests, disabled fields)
    // TODO restart game
    // TODO styling........
}

function startNewGame() {
    gameService?.startNewGame().then(resp => gameId = resp);
    setCookie("currentGame", gameId);
}

</script>

<template>
    <div>
        weeee, la game weeee
    </div>
    <div v-if="!isGameOver">
        <MonsterSelector :items="monsterList" v-model="selectedMonster"></MonsterSelector>
        <button @click="sendGuess()">
            <span>{{ $t("ui.generic.sendGuess")}}</span>
        </button>
    </div>
    <div>
        <GameGuessList></GameGuessList>
    </div>
    <div v-if="isGameOver">
        <button @click="startNewGame()">
            <span> {{ $t("ui.reneric.newGame") }}</span>
        </button>
    </div>
</template>