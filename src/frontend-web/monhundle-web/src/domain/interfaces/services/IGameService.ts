export default interface IGameService {
    startNewGame: () => Promise<string>;
    makeGuess: (monsterCode: string) => Promise<void>;
    resumeGame: (gameId: string) => Promise<boolean>;
}
