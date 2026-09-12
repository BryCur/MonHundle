import { beforeEach, describe, expect, it } from "vitest";
import { CookieKeys, setCookie, getCookie, deleteCookie, clearCookies } from "@/services/CookieService";

function wipeAllCookies() {
  for (const entry of document.cookie.split(";")) {
    const name = entry.split("=")[0]?.trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }
}

describe("CookieService", () => {
  beforeEach(() => {
    wipeAllCookies();
  });

  it("round-trips a value through setCookie / getCookie", () => {
    setCookie("myKey", "myValue");

    expect(getCookie("myKey")).toBe("myValue");
  });

  it("returns undefined for a cookie that was never set", () => {
    expect(getCookie("missing")).toBeUndefined();
  });

  it("removes a cookie with deleteCookie", () => {
    setCookie("temp", "x");
    deleteCookie("temp");

    expect(getCookie("temp")).toBeUndefined();
  });

  it("clearCookies removes every known cookie key", () => {
    setCookie(CookieKeys.CURRENT_DAILY_GAME, "d");
    setCookie(CookieKeys.CURRENT_UNLIMITED_GAME, "u");

    clearCookies();

    expect(getCookie(CookieKeys.CURRENT_DAILY_GAME)).toBeUndefined();
    expect(getCookie(CookieKeys.CURRENT_UNLIMITED_GAME)).toBeUndefined();
  });
});
