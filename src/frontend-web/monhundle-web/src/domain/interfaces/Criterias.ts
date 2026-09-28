import type { Afflictions, Habitats, Classifications, Weaknesses } from '@/domain/ApiModels';

export interface Criterias {
    generation: number;
    threatLevel: number;
    classification: Classifications;
    weaknesses: Weaknesses[];
    afflictions: Afflictions[];
    habitats: Habitats[];
}
