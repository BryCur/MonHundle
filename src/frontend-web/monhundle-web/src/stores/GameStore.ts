import type { GameStates } from '@/domain/enums/GameStates'
import GameStatus from '@/domain/GameStatus'
import type Guess from '@/domain/Guess'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  const game = ref<GameStatus | null>(null)

  function setGame(newGame: GameStatus) {
    game.value = newGame
  }

  function addGuess(guess: Guess){
    game.value?.addguess(guess);
  }

  function setState(state: GameStates) {
    if(!game.value){
      return;
    }

    game.value.state = state;
  }

  return { game, setGame, addGuess, setState}
})
