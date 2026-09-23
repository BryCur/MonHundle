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

function response(body: string, ok = true, status = 200) {
  return { ok, status, text: async () => body };
}

// Everything else UserApi.authUser() does (request shape, happy-path parsing, non-ok
// status, non-UUID body) is covered by
// src/services/ApiService/__integration-tests__/UserApi.integration.spec.ts. This one
// case isn't: a response body that fails JSON.parse entirely, as opposed to one that
// parses fine but isn't a UUID — a different branch in authUser()'s try/catch.
describe("UserApi.authUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws when the response body is not valid JSON", async () => {
    apiFetchMock.mockResolvedValue(response("<<not json>>"));
    const api = new UserApi();

    await expect(api.authUser()).rejects.toThrow(/valid user id/);
    expect(setStoredUserId).not.toHaveBeenCalled();
  });
});
