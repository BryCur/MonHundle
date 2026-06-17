export default class SettingsResponse {
    enableTableVisualAid: boolean;
    gameList: string[];
    currentDailyGameUuid: string;
    currentUnlimitedGameUuid: string;

    constructor(enableTableVisualAid: boolean, gameList: string[], currentDailyGameUuid: string, currentUnlimitedGameUuid: string) {
        this.enableTableVisualAid = enableTableVisualAid;
        this.gameList = gameList;
        this.currentDailyGameUuid = currentDailyGameUuid;
        this.currentUnlimitedGameUuid = currentUnlimitedGameUuid;
    }
}