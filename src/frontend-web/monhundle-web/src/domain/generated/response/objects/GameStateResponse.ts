/* eslint-disable */
/**
 * AUTO-GENERATED from the backend OpenAPI contract. Do not edit by hand.
 */

import type { GameModes } from '../../enum/GameModes';
import type { GameStates } from '../../enum/GameStates';
import type { MonsterGuessDTO } from '../../models/MonsterGuessDTO';
export interface GameStateResponse {
  gameId?: string;
  state?: GameStates;
  guesses?: MonsterGuessDTO[] | null;
  gameMode?: GameModes;
}
