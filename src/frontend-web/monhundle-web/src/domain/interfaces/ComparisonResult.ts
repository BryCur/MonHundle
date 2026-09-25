import type { ComparisonResults } from '@/domain/enums/ComparisonResults';

export interface ComparisonResult {
    generation: ComparisonResults;
    threatLevel: ComparisonResults;
    classification: ComparisonResults;
    weaknesses: ComparisonResults;
    afflictions: ComparisonResults;
    habitats: ComparisonResults;
}
