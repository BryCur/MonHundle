import { mount, flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import { createI18n } from "vue-i18n";
import SettingView from "@/views/SettingView.vue";
import { LocalStorageKeys } from "@/services/LocalStorageService";

// real (empty) i18n so both `t()` and the template's `$t()` resolve to the key path
const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false,
  locale: "en",
  messages: { en: {} },
});

async function mountView() {
  const wrapper = mount(SettingView, { global: { plugins: [i18n], provide: { settingsApi: {} } } });
  await flushPromises(); // onMounted fills gameList from localStorage, then the label re-renders
  return wrapper;
}

describe("SettingView game-list label", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses the short label when fewer than 4 games are selected", async () => {
    localStorage.setItem(LocalStorageKeys.GAME_LIST, JSON.stringify(["MHW", "MHR"]));

    const text = (await mountView()).text();

    expect(text).toContain("ui.settings.gameList.shortLabel");
    expect(text).not.toContain("ui.settings.gameList.label");
  });

  it("uses the truncated label (with the total count) when 4+ games are selected", async () => {
    localStorage.setItem(LocalStorageKeys.GAME_LIST, JSON.stringify(["A", "B", "C", "D", "E"]));

    expect((await mountView()).text()).toContain("ui.settings.gameList.label");
  });
});
