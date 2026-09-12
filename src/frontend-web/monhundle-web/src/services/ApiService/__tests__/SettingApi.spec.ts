import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/ApiService/ApiBaseAccess", () => ({
  apiFetch: vi.fn(),
}));
vi.mock("@/services/LocalStorageService", () => ({
  setStoredUserId: vi.fn(),
}));

import { SettingsApi } from "@/services/ApiService/SettingApi";
import { apiFetch } from "@/services/ApiService/ApiBaseAccess";
import { setStoredUserId } from "@/services/LocalStorageService";

const apiFetchMock = apiFetch as unknown as ReturnType<typeof vi.fn>;
const VALID_UUID = "11111111-1111-1111-1111-111111111111";

describe("SettingsApi", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("validateUser", () => {
    it("returns true only on a 200 response", async () => {
      apiFetchMock.mockResolvedValue({ status: 200 });
      await expect(new SettingsApi().validateUser("uid")).resolves.toBe(true);
    });

    it("returns false on any non-200 response", async () => {
      apiFetchMock.mockResolvedValue({ status: 404 });
      await expect(new SettingsApi().validateUser("uid")).resolves.toBe(false);
    });
  });

  describe("getProfile", () => {
    it("returns the parsed profile when ok", async () => {
      const profile = { enableTableVisualAid: true, gameList: ["MHW"], currentDailyGameUuid: "", currentUnlimitedGameUuid: "" };
      apiFetchMock.mockResolvedValue({ ok: true, json: async () => profile });

      await expect(new SettingsApi().getProfile(VALID_UUID)).resolves.toEqual(profile);
    });

    it("returns null when not ok", async () => {
      apiFetchMock.mockResolvedValue({ ok: false });

      await expect(new SettingsApi().getProfile(VALID_UUID)).resolves.toBeNull();
    });
  });

  describe("loadUser", () => {
    it("stores the loaded id when the body is a valid uuid", async () => {
      apiFetchMock.mockResolvedValue({ ok: true, text: async () => JSON.stringify(VALID_UUID) });

      await new SettingsApi().loadUser("22222222-2222-2222-2222-222222222222");

      expect(setStoredUserId).toHaveBeenCalledWith(VALID_UUID);
    });

    it("falls back to the requested id when the body cannot be parsed", async () => {
      apiFetchMock.mockResolvedValue({ ok: true, text: async () => "not-json" });

      await new SettingsApi().loadUser(VALID_UUID);

      expect(setStoredUserId).toHaveBeenCalledWith(VALID_UUID);
    });

    it("does not touch the stored id when the response is not ok", async () => {
      apiFetchMock.mockResolvedValue({ ok: false, text: async () => "" });

      await new SettingsApi().loadUser(VALID_UUID);

      expect(setStoredUserId).not.toHaveBeenCalled();
    });
  });
});
