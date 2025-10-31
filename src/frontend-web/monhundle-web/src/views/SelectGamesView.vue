<script setup lang="ts">
import { useRouter } from 'vue-router';
import { apiFetch } from '../services/ApiService/ApiBaseAccess';
import { useI18n } from 'vue-i18n'
import { onMounted, ref } from 'vue';

const { t } = useI18n()
const router = useRouter()

const ready = ref(false);
let selectedGames = ref(new Set<string>([]));
let gameList: string[];

onMounted(async () => {
    ready.value = false;
    const response = await apiFetch("/resources/game-titles", { method: "GET"});

    gameList = (await response.json()) as string[];
    ready.value = true;
}) 

function toggleGameSelection(game: string) {
    if(selectedGames.value.has(game)) {
        selectedGames.value.delete(game);
    } else {
        selectedGames.value.add(game);
    }
}

function confirmSelection() {
    if(selectedGames.value.size > 0) {
        localStorage.setItem("gameList", JSON.stringify(Array.from(selectedGames.value)))
    } else {
        localStorage.setItem("gameList", JSON.stringify(gameList))
    }

    router.push("/unlimited");
}
</script>

<template>
    <div class="gamelist-root-container">
        <div v-if="!ready"> loading... </div>
        <div v-else class="list-container" :class="{ 'has-selection': selectedGames.size > 0 }">
            <div 
            v-for="game in gameList" 
            @click="toggleGameSelection(game)" 
            class="list-item"
            :class="{ selected: selectedGames.has(game) }"
            >
                <img :src="'/images/games/' + game + '.png'" alt="logo" class="game-logo"></img>
                <div class="game-title">{{ $t("game.titles." + game) }}</div>
            </div>
            <div class="button container">
                <button @click="confirmSelection()" class="btn btn-confirm">
                    {{ $t("ui.generic.confirm") }}
                </button>
            </div>
        </div>

    </div>
</template>

<style lang="scss" scoped>
.list-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  padding: 1.5rem;
  background-color: #1a1a1a;
  border-radius: 1rem;

  &.has-selection {
    .list-item:not(.selected) {
      opacity: 0.5;
      transform: scale(0.95);
      filter: grayscale(50%);
    }
  }

  .list-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 180px;
    padding: 1rem;
    background-color: #2a2a2a;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;

    &:hover {
      background-color: #353535;
      transform: scale(1.05);
    }

    &.selected {
      background-color: #5a5a5a;
      color: white;
      transform: scale(1.07);
      box-shadow: 0 0 10px rgba(74, 140, 255, 0.5);
    }

    .game-logo {
      width: 120px;
      height: 120px;
      object-fit: contain;
      border-radius: 8px;
      margin-bottom: 0.75rem;
    }

    .game-title {
      font-size: 1rem;
      font-weight: 500;
      color: #f0f0f0;
      text-align: center;
    }
  }
}
</style>