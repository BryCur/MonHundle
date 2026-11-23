/**
 * AUTO-GENERATED from the backend OpenAPI contract. Do not edit by hand.
 */

import type { PlayerPreferencesDTO } from '../../models/PlayerPreferencesDTO';
export interface PlayerProfileResponse {
    preferences: PlayerPreferencesDTO;
    currentDailyGameUuid: string | null;
    currentUnlimitedGameUuid: string | null;
}
