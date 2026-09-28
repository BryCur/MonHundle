import type { ComparisonOutcomes } from '@/domain/ApiModels';

export interface ComparisonResult {
    generation: ComparisonOutcomes;
    threatLevel: ComparisonOutcomes;
    classification: ComparisonOutcomes;
    weaknesses: ComparisonOutcomes;
    afflictions: ComparisonOutcomes;
    habitats: ComparisonOutcomes;
}
