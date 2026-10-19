export default interface IGameService {
    startNewGame: () => Promise<string>;
    makeGuess: (gameId: string, monsterCode: string) => Promise<void>;
    resumeGame: (gameId: string) => Promise<boolean>;
}
