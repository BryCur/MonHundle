import type { Afflictions } from '@/domain/enums/Criterias/Afflictions';
import type { Biomes } from '@/domain/enums/Criterias/Biomes';
import type { Classifications } from '@/domain/enums/Criterias/Classifications';
import type { Weaknesses } from '@/domain/enums/Criterias/Weaknesses';

export interface Criterias {
    generation: number;
    threatLevel: number;
    classification: Classifications;
    weaknesses: Weaknesses[];
    afflictions: Afflictions[];
    habitats: Biomes[];
}
