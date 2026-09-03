export function setCookie(name: string, val: string, durationMs: number = 7 * 24 * 60 * 60 * 1000) { // 7 days duration by default
    const date = new Date();
    const value = val;

    date.setTime(date.getTime() + durationMs);
    document.cookie = name+"="+value+"; expires="+date.toUTCString()+"; path=/";
}

export function getCookie(name: string) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");

    if (parts.length == 2 && parts[1] != undefined) {
        return parts.pop()!.split(";").shift();
    }
}

export function deleteCookie(name: string) {
    const date = new Date();

    // Set it expire in -1 days
    date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));
    document.cookie = name+"=; expires="+date.toUTCString()+"; path=/";
}

export function clearCookies() {
    const date = new Date();
    date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));

    for (const cookieKey of Object.values(CookieKeys)) {
        document.cookie = cookieKey+"=; expires="+date.toUTCString()+"; path=/";
    }
}

export enum CookieKeys {
    CURRENT_DAILY_GAME = "currentDailyGame",
    CURRENT_UNLIMITED_GAME = "currentUnlimitedGame"
}
