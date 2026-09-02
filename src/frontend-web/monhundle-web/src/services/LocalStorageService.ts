export enum LocalStorageKeys {
    GAME_LIST = "gameList",
    TABLE_VISUAL_ACCESSIBILITY = "enableTableVisualA11y",
    USER_ID = "user_id",
}

/**
 * The player identifier used to be kept in a cookie set by the API. Because the API is served
 * from a different site than the web app, Safari/iOS refuses to store or resend that third-party
 * cookie, which left those users permanently unauthenticated. The identifier now lives in
 * localStorage and travels to the API as an `Authorization: Bearer <uuid>` header instead.
 */
export function getStoredUserId(): string | null {
    return localStorage.getItem(LocalStorageKeys.USER_ID);
}

export function setStoredUserId(userId: string): void {
    localStorage.setItem(LocalStorageKeys.USER_ID, userId);
}

export function clearStoredUserId(): void {
    localStorage.removeItem(LocalStorageKeys.USER_ID);
}
