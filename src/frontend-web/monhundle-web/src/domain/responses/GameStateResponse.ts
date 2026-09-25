import type { GameModes } from '@/domain/enums/GameModes';
import type { GameStates } from '@/domain/enums/GameStates';
import type Guess from '@/domain/Guess';

export default class GameStateResponse {
    public readonly gameId: string;
    public readonly guesses: Guess[];
    public readonly state: GameStates;
    public readonly gameMode: GameModes;

    public constructor(gameId: string, guesses: Guess[], state: GameStates, gameMode: GameModes) {
        this.gameId = gameId;
        this.guesses = guesses;
        this.state = state;
        this.gameMode = gameMode;
    }
}
