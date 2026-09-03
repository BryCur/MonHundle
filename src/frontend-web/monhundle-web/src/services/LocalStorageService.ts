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
 *
 * Every access is guarded: some browsers throw when touching localStorage (Safari private mode on
 * older versions, storage blocked by policy, some embedded webviews, quota exhaustion). Since
 * getStoredUserId() runs on every API call, an unguarded throw would break all requests. On
 * failure we behave as if nothing is stored.
 */
export function getStoredUserId(): string | null {
    try {
        return localStorage.getItem(LocalStorageKeys.USER_ID);
    } catch (err) {
        console.warn("could not read the stored user id", err);
        return null;
    }
}

export function setStoredUserId(userId: string): void {
    try {
        localStorage.setItem(LocalStorageKeys.USER_ID, userId);
    } catch (err) {
        console.warn("could not persist the user id", err);
    }
}

export function clearStoredUserId(): void {
    try {
        localStorage.removeItem(LocalStorageKeys.USER_ID);
    } catch (err) {
        console.warn("could not clear the stored user id", err);
    }
}
