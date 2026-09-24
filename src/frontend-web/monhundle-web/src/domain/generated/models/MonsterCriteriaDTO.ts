/* eslint-disable */
/**
 * AUTO-GENERATED from the backend OpenAPI contract. Do not edit by hand.
 */

import type { Afflictions } from '../enum/Afflictions';
import type { Classifications } from '../enum/Classifications';
import type { Habitats } from '../enum/Habitats';
import type { Weaknesses } from '../enum/Weaknesses';
export interface MonsterCriteriaDTO {
    generation?: number;
    threatLevel?: number;
    classification?: Classifications;
    weaknesses?: Weaknesses[] | null;
    afflictions?: Afflictions[] | null;
    habitats?: Habitats[] | null;
}
