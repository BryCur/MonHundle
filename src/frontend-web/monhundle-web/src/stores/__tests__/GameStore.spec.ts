import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '@/stores/GameStore';
import { GameStates, GameModes, type Guess } from '@/domain/ApiModels';
import GameStatus from '@/domain/GameStatus';

describe('GameStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('should initialise the gameStore with whatever game we set it to be', () => {
        const store = useGameStore();
        const game: GameStatus = new GameStatus('abc', GameModes.Unlimited);
        store.setGame(game);

        expect(store.game).toStrictEqual(game);
    });

    it('should add a guess to the game guess list', () => {
        const store = useGameStore();
        const game: GameStatus = new GameStatus('abc', GameModes.Unlimited);

        store.setGame(game);
        const guess = { monsterCode: 'rathalos' } as Guess;

        store.addGuess(guess);

        expect(store.game?.guesses.length).toBe(1);
        expect(store.game?.guesses[0]).toStrictEqual(guess);
    });

    it('should update the game state', () => {
        const store = useGameStore();
        const game: GameStatus = new GameStatus('abc', GameModes.Unlimited);
        store.setGame(game);
        store.setState(GameStates.Win);

        expect(store.game?.state).toStrictEqual(GameStates.Win);
    });

    it('should indicate whether a game is null correctly', () => {
        const store = useGameStore();
        const game: GameStatus = new GameStatus('abc', GameModes.Unlimited);

        expect(store.isGameNull).toBeTruthy();
        store.setGame(game);
        expect(store.isGameNull).toBeFalsy();
    });

    it('should indicate whether a game is ongoing correctly', () => {
        const store = useGameStore();
        const game: GameStatus = new GameStatus('abc', GameModes.Unlimited);
        store.setGame(game);

        expect(store.isGameOngoing).toBeTruthy();
        store.setState(GameStates.Win);
        expect(store.isGameOngoing).toBeFalsy();
        store.setState(GameStates.Lose);
        expect(store.isGameOngoing).toBeFalsy();
        store.setState(GameStates.Forfeited);
        expect(store.isGameOngoing).toBeFalsy();
    });

    it('should not throw when adding a guess with no active game', () => {
        const store = useGameStore();

        expect(() => store.addGuess({ monsterCode: 'rathalos' } as Guess)).not.toThrow();
        expect(store.game).toBeNull();
    });

    it('should not throw when setting the state with no active game', () => {
        const store = useGameStore();

        expect(() => store.setState(GameStates.Win)).not.toThrow();
        expect(store.game).toBeNull();
    });

    it('should report a null game as not ongoing', () => {
        const store = useGameStore();

        expect(store.isGameOngoing).toBe(false);
    });

    it('should replace the current game when setGame is called again', () => {
        const store = useGameStore();
        store.setGame(new GameStatus('first', GameModes.Unlimited));

        const replacement = new GameStatus('second', GameModes.Daily);
        store.setGame(replacement);

        expect(store.game).toStrictEqual(replacement);
        expect(store.game?.gameId).toBe('second');
    });

    it('should not report a game over when there is no game', () => {
        const store = useGameStore();

        expect(store.isGameOver).toBe(false);
    });

    it('should report a game over only once the game has left the ongoing state', () => {
        const store = useGameStore();
        store.setGame(new GameStatus('abc', GameModes.Unlimited));

        expect(store.isGameOver).toBe(false);
        store.setState(GameStates.Win);
        expect(store.isGameOver).toBe(true);
        store.setState(GameStates.Lose);
        expect(store.isGameOver).toBe(true);
        store.setState(GameStates.Forfeited);
        expect(store.isGameOver).toBe(true);
    });

    it('should expose an empty guess list when there is no game', () => {
        const store = useGameStore();

        expect(store.guesses).toStrictEqual([]);
    });

    it('should expose the guesses of the current game', () => {
        const store = useGameStore();
        store.setGame(new GameStatus('abc', GameModes.Unlimited));
        const guess = { monsterCode: 'rathalos' } as Guess;

        store.addGuess(guess);

        expect(store.guesses).toStrictEqual([guess]);
    });

    it('should have no last guess when there is no game or no guess yet', () => {
        const store = useGameStore();
        expect(store.lastGuess).toBeUndefined();

        store.setGame(new GameStatus('abc', GameModes.Unlimited));
        expect(store.lastGuess).toBeUndefined();
    });

    it('should expose the most recent guess as the last guess', () => {
        const store = useGameStore();
        store.setGame(new GameStatus('abc', GameModes.Unlimited));
        const lastGuess = { monsterCode: 'nargacuga' } as Guess;

        store.addGuess({ monsterCode: 'rathalos' } as Guess);
        store.addGuess(lastGuess);

        expect(store.lastGuess).toStrictEqual(lastGuess);
    });

    it('should expose the id of the current game, if any', () => {
        const store = useGameStore();
        expect(store.gameId).toBeUndefined();

        store.setGame(new GameStatus('abc', GameModes.Unlimited));
        expect(store.gameId).toBe('abc');
    });
});
