export enum LocalStorageKeys {
    GAME_LIST = "gameList",
    TABLE_VISUAL_ACCESSIBILITY = "enableTableVisualA11y",
    USER_ID = "user_id",
}

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
