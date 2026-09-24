import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '@/stores/GameStore';
import { GameStates } from '@/domain/enums/GameStates';
import type Guess from '@/domain/Guess';
import GameStatus from '@/domain/GameStatus';
import { GameModes } from '@/domain/enums/GameModes';

describe('GameStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('should initialise the gameStore with whatever game we set it to be', () => {
        const store = useGameStore();
        const game: GameStatus = new GameStatus('abc', GameModes.Unlimited);
        store.setGame(game as any);

        expect(store.game).toStrictEqual(game);
    });

    it('should add a guess to the game guess list', () => {
        const store = useGameStore();
        const game: GameStatus = new GameStatus('abc', GameModes.Unlimited);

        store.setGame(game as any);
        const guess = { monsterCode: 'rathalos' } as Guess;

        store.addGuess(guess);

        expect(store.game?.guesses.length).toBe(1);
        expect(store.game?.guesses[0]).toStrictEqual(guess);
    });

    it('should update the game state', () => {
        const store = useGameStore();
        const game: GameStatus = new GameStatus('abc', GameModes.Unlimited);
        store.setGame(game as any);
        store.setState(GameStates.Win);

        expect(store.game?.state).toStrictEqual(GameStates.Win);
    });

    it('should indicate whether a game is null correctly', () => {
        const store = useGameStore();
        const game: GameStatus = new GameStatus('abc', GameModes.Unlimited);

        expect(store.isGameNull()).toBeTruthy();
        store.setGame(game);
        expect(store.isGameNull()).toBeFalsy();
    });

    it('should indicate whether a game is ongoing correctly', () => {
        const store = useGameStore();
        const game: GameStatus = new GameStatus('abc', GameModes.Unlimited);
        store.setGame(game);

        expect(store.isGameOngoing()).toBeTruthy();
        store.setState(GameStates.Win);
        expect(store.isGameOngoing()).toBeFalsy();
        store.setState(GameStates.Loss);
        expect(store.isGameOngoing()).toBeFalsy();
        store.setState(GameStates.Forfeited);
        expect(store.isGameOngoing()).toBeFalsy();
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

        expect(store.isGameOngoing()).toBe(false);
    });

    it('should replace the current game when setGame is called again', () => {
        const store = useGameStore();
        store.setGame(new GameStatus('first', GameModes.Unlimited));

        const replacement = new GameStatus('second', GameModes.Daily);
        store.setGame(replacement);

        expect(store.game).toStrictEqual(replacement);
        expect(store.game?.gameId).toBe('second');
    });
});
