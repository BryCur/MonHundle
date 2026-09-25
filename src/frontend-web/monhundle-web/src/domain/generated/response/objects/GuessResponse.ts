/**
 * AUTO-GENERATED from the backend OpenAPI contract. Do not edit by hand.
 */

import type { GameStates } from '../../enum/GameStates';
import type { MonsterComparisonResult } from '../../models/MonsterComparisonResult';
import type { MonsterCriteriaDTO } from '../../models/MonsterCriteriaDTO';
export interface GuessResponse {
    monsterCode?: string | null;
    criterias?: MonsterCriteriaDTO;
    comparisonResult?: MonsterComparisonResult;
    gameStateAfterGuess?: GameStates;
}
