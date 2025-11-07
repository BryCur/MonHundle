<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { apiFetch } from '../services/ApiService/ApiBaseAccess';
import { setCookie } from '../services/CookieService';
import MonsterSelector from '../components/game-elements/MonsterSelector.vue';
import GameGuessList from '../components/game-elements/GameGuessList.vue';
import { useGameStore } from '../stores/GameStore';
import GameStatus from '../domain/GameState';
import Guess from '../domain/Guess';

const gameStore = useGameStore();

let ready = ref(false);
let monsterList = ref<string[]>([])
let selectedMonster = ref<string | undefined>(undefined);
let gameId :string; 

onMounted(async () => {
    ready.value = false;
    const gameResponse = await apiFetch("/game/start", { method: "POST", credentials: 'include'});
    gameId = (await gameResponse.json()) as string;
    setCookie("currentGame", gameId);
    gameStore.setGame(new GameStatus(gameId))

    let gameList = JSON.parse(localStorage.getItem("gameList") ?? "") as string[];
    const monsterListResponse = await apiFetch(`/resources/monster-choices?gameTitles=${gameList.join(",")}`,  { method: "GET", credentials: 'include'})
    let rawMonsterList = (await monsterListResponse.json());
    monsterList.value = rawMonsterList
    ready.value = true;
}) 

async function sendGuess() {
    // send to api
    const guessRequestBody = {"gameId": gameId, "guessId": selectedMonster.value}
    const guessResponse = await apiFetch("/game/guess", { method: "POST", body: JSON.stringify(guessRequestBody)});
    let guess: Guess = (await guessResponse.json()) as Guess;
    console.log("guess", guess)
    gameStore.addGuess(guess);
}
</script>

<template>
    <div>
        weeee, la game weeee
    </div>
    <div>
        <MonsterSelector :items="monsterList" v-model="selectedMonster"></MonsterSelector>
        <button @click="sendGuess()">
            <span>{{ $t("ui.generic.sendGuess")}}</span>
        </button>
    </div>
    <div>
        <GameGuessList></GameGuessList>
    </div>
</template>