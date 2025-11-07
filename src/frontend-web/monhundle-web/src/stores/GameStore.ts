import type GameStatus from '@/domain/GameState'
import type Guess from '@/domain/Guess'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  const game = ref<GameStatus | null>(null)

  function setGame(newGame: GameStatus) {
    game.value = newGame
  }

  function resetGame() {
    game.value = null
  }

  function addGuess(guess: Guess){
    game.value?.addguess(guess);
  }

  return { game, setGame, resetGame, addGuess }
})
