export default interface IGameService {
    /**
     * Request the creation of a new game
     * @returns id of the newly created game
     */
    startNewGame: () => Promise<string>;

    /**
     * Submit a guess to the currently loaded game and update the status of the game
     * with the new guess and its result.
     * @param monsterCode code of the monster to submit as a guess
     */
    makeGuess: (monsterCode: string) => Promise<void>;

    /**
     * Fetches the game and loads it into the store, regardless the state of the loaded game.
     * @param gameId ID of the game to retrieve from database
     * @returns true if the game was found and loaded, false if the backend has no such game.
     */
    resumeGame: (gameId: string) => Promise<boolean>;
}
