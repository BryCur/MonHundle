const CDN_BASE_URL = import.meta.env.VITE_ICON_CDN_URL;

export function getLatestIconForMonster(monsterCode: String | undefined) : string {
    const latestFolder = "/latest/";
    return CDN_BASE_URL + latestFolder + (monsterCode ?? "unknown") + '.png';
}