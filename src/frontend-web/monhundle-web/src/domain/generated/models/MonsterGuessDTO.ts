/**
 * AUTO-GENERATED from the backend OpenAPI contract. Do not edit by hand.
 */

import type { MonsterComparisonResult } from './MonsterComparisonResult';
import type { MonsterCriteriaDTO } from './MonsterCriteriaDTO';
export interface MonsterGuessDTO {
    monsterCode?: string | null;
    criterias?: MonsterCriteriaDTO;
    comparisonResult?: MonsterComparisonResult;
}
