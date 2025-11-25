import { describe, it, expect, beforeEach } from "vitest"
import { setActivePinia, createPinia } from "pinia"
import { useGameStore } from "@/stores/gameStore"
import { GameStates } from "@/domain/enums/GameStates"
import type Guess from "@/domain/Guess"
import GameStatus from "@/domain/GameStatus"

describe("GameStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("should initialise the gameStore with whatever game we set it to be", () => {
        const store = useGameStore();
        const game: GameStatus = new GameStatus("abc");
        store.setGame(game as any);

        expect(store.game).toStrictEqual(game);
    });

    it("should add a guess to the game guess list", () => {
        const store = useGameStore();
        const game: GameStatus = new GameStatus("abc");

        store.setGame(game as any);
        const guess = { monsterCode: "rathalos" } as Guess;

        store.addGuess(guess);

        expect(store.game?.guesses.length).toBe(1);
        expect(store.game?.guesses[0]).toStrictEqual(guess);
    });

    it("should update the game state", () => {
        const store = useGameStore();
        const game: GameStatus = new GameStatus("abc");
        store.setGame(game as any);
        store.setState(GameStates.Win);

        expect(store.game?.state).toStrictEqual(GameStates.Win);
    });

    it("should indicate whether a game is null correctly", () => {
        const store = useGameStore();
        const game: GameStatus = new GameStatus("abc");

        expect(store.isGameNull()).toBeTruthy();
        store.setGame(game);
        expect(store.isGameNull()).toBeFalsy();
    });

    it("should indicate whether a game is ongoing correctly", () => {
        const store = useGameStore();
        const game: GameStatus = new GameStatus("abc");
        store.setGame(game);

        expect(store.isGameOngoing()).toBeTruthy();
        store.setState(GameStates.Win);
        expect(store.isGameOngoing()).toBeFalsy();
        store.setState(GameStates.Loss);
        expect(store.isGameOngoing()).toBeFalsy();
        store.setState(GameStates.Forfeited);
        expect(store.isGameOngoing()).toBeFalsy();
    });
})
