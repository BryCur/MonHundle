/**
 * AUTO-GENERATED from the backend OpenAPI contract. Do not edit by hand.
 */

import type { ComparisonOutcomes } from '../enum/ComparisonOutcomes';
export interface MonsterComparisonResult {
    generation?: ComparisonOutcomes;
    threatLevel?: ComparisonOutcomes;
    classification?: ComparisonOutcomes;
    weaknesses?: ComparisonOutcomes;
    afflictions?: ComparisonOutcomes;
    habitats?: ComparisonOutcomes;
}
