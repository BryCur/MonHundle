import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/ApiService/ApiBaseAccess", () => ({
  apiFetch: vi.fn(),
}));
vi.mock("@/services/LocalStorageService", () => ({
  setStoredUserId: vi.fn(),
}));

import { UserApi } from "@/services/ApiService/UserApi";
import { apiFetch } from "@/services/ApiService/ApiBaseAccess";
import { setStoredUserId } from "@/services/LocalStorageService";

const apiFetchMock = apiFetch as unknown as ReturnType<typeof vi.fn>;
const VALID_UUID = "11111111-1111-1111-1111-111111111111";

function response(body: string, ok = true, status = 200) {
  return { ok, status, text: async () => body };
}

describe("UserApi.authUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores the user id and marks itself authenticated on a valid response", async () => {
    apiFetchMock.mockResolvedValue(response(JSON.stringify(VALID_UUID)));
    const api = new UserApi();

    await api.authUser();

    expect(setStoredUserId).toHaveBeenCalledWith(VALID_UUID);
    expect(api.authenticated).toBe(true);
  });

  it("throws and stays unauthenticated when the response is not ok", async () => {
    apiFetchMock.mockResolvedValue(response("", false, 500));
    const api = new UserApi();

    await expect(api.authUser()).rejects.toThrow(/500/);
    expect(setStoredUserId).not.toHaveBeenCalled();
    expect(api.authenticated).toBe(false);
  });

  it("throws when the response body is not valid JSON", async () => {
    apiFetchMock.mockResolvedValue(response("<<not json>>"));
    const api = new UserApi();

    await expect(api.authUser()).rejects.toThrow(/valid user id/);
    expect(setStoredUserId).not.toHaveBeenCalled();
  });

  it("throws when the parsed id is not a valid UUID", async () => {
    apiFetchMock.mockResolvedValue(response(JSON.stringify("not-a-uuid")));
    const api = new UserApi();

    await expect(api.authUser()).rejects.toThrow(/valid user id/);
    expect(setStoredUserId).not.toHaveBeenCalled();
  });
});
