import type { Afflictions } from "../enums/Criterias/Afflictions";
import type { Biomes } from "../enums/Criterias/Biomes";
import type { Classifications } from "../enums/Criterias/Classifications";
import type { Weaknesses } from "../enums/Criterias/Weaknesses";

export interface Criterias {
    generation: number;
    threatLevel : number;
    classification: Classifications;
    weaknesses: Weaknesses[];
    afflictions: Afflictions[];
    habitats: Biomes[];
}