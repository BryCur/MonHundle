import { describe, expect, it } from 'vitest';
import { getLatestIconForMonster } from '@/services/MonsterIconeService';

const CDN = import.meta.env.VITE_ICON_CDN_URL;

describe('getLatestIconForMonster', () => {
    it('builds the latest-icon url for a monster code', () => {
        expect(getLatestIconForMonster('rathalos')).toBe(`${CDN}/latest/rathalos.png`);
    });

    it("falls back to the 'unknown' icon when the code is undefined", () => {
        expect(getLatestIconForMonster(undefined)).toBe(`${CDN}/latest/unknown.png`);
    });
});
