import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/ApiService/ApiBaseAccess", () => ({
  apiFetch: vi.fn(),
}));

import ResourceApi from "@/services/ApiService/ResourceApi";
import { apiFetch } from "@/services/ApiService/ApiBaseAccess";

const apiFetchMock = apiFetch as unknown as ReturnType<typeof vi.fn>;

describe("ResourceApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiFetchMock.mockResolvedValue({ json: async () => [] });
  });

  it("getMonstersOptions omits the query string when no game titles are given", async () => {
    await new ResourceApi().getMonstersOptions([]);

    expect(apiFetchMock).toHaveBeenCalledWith("/resources/monster-choices", { method: "GET" });
  });

  it("getMonstersOptions appends a comma-separated gameTitles query when titles are given", async () => {
    await new ResourceApi().getMonstersOptions(["MHW", "MHR"]);

    expect(apiFetchMock).toHaveBeenCalledWith("/resources/monster-choices?gameTitles=MHW,MHR", { method: "GET" });
  });

  it("getGameTitles calls the game-titles endpoint", async () => {
    await new ResourceApi().getGameTitles();

    expect(apiFetchMock).toHaveBeenCalledWith("/resources/game-titles", { method: "GET" });
  });
});
