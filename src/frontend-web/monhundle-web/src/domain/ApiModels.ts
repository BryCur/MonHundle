// Front-end entry point for the types generated from the backend contract (src/domain/generated/).
// The rest of the app imports them from here, never from generated/ directly (enforced by ESLint).

import type { MonsterComparisonResult } from '@/domain/generated/models/MonsterComparisonResult';
import type { MonsterCriteriaDTO } from '@/domain/generated/models/MonsterCriteriaDTO';
import type { MonsterGuessDTO } from '@/domain/generated/models/MonsterGuessDTO';
import type { PlayerProfileResponse } from '@/domain/generated/response/objects/PlayerProfileResponse';
import type { UserPreferencesBody } from '@/domain/generated/request-params/UserPreferencesBody';

// --- Enums (real runtime objects) and the registry of their names, used to build translation keys ---
export { Afflictions } from '@/domain/generated/enum/Afflictions';
export { Classifications } from '@/domain/generated/enum/Classifications';
export { ComparisonOutcomes } from '@/domain/generated/enum/ComparisonOutcomes';
export { GameModes } from '@/domain/generated/enum/GameModes';
export { GameStates } from '@/domain/generated/enum/GameStates';
export { Habitats } from '@/domain/generated/enum/Habitats';
export { Weaknesses } from '@/domain/generated/enum/Weaknesses';
export { enumNames } from '@/domain/generated/enum/enumNames';

// --- Game models, under their front-end names ---
export type Guess = MonsterGuessDTO;
export type Criterias = MonsterCriteriaDTO;
export type ComparisonResult = MonsterComparisonResult;

// --- Request and response payloads, under their front-end names ---
export type SettingsResponse = PlayerProfileResponse;
export type UserSettingsBody = UserPreferencesBody;
export type { GameStateResponse } from '@/domain/generated/response/objects/GameStateResponse';
export type { GuessResponse } from '@/domain/generated/response/objects/GuessResponse';
export type { MakeGuessBody } from '@/domain/generated/request-params/MakeGuessBody';
