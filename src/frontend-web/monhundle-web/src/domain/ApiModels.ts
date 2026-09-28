// Front-end entry point for the types generated from the backend contract (src/domain/generated/).
// The rest of the app imports them from here, never from generated/ directly.

// --- Enums (real runtime objects) and the registry of their names, used to build translation keys ---
export { Afflictions } from '@/domain/generated/enum/Afflictions';
export { Classifications } from '@/domain/generated/enum/Classifications';
export { ComparisonOutcomes } from '@/domain/generated/enum/ComparisonOutcomes';
export { GameModes } from '@/domain/generated/enum/GameModes';
export { GameStates } from '@/domain/generated/enum/GameStates';
export { Habitats } from '@/domain/generated/enum/Habitats';
export { Weaknesses } from '@/domain/generated/enum/Weaknesses';
export { enumNames } from '@/domain/generated/enum/enumNames';
