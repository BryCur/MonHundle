import { GameStates, type Guess } from '@/domain/ApiModels';
import GameStatus from '@/domain/GameStatus';
import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
    state: () => ({
        game: null as GameStatus | null,
    }),

    getters: {
        isGameNull: (state): boolean => state.game === null,
        isGameOngoing: (state): boolean => state.game?.state === GameStates.Ongoing,
    },

    actions: {
        setGame(newGame: GameStatus) {
            this.game = newGame;
        },

        addGuess(guess: Guess) {
            this.game?.addGuess(guess);
        },

        setState(state: GameStates) {
            if (this.game) {
                this.game.state = state;
            }
        },
    },
});

export type GameStore = ReturnType<typeof useGameStore>;
