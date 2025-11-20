
export enum Biomes {
    Cave,
    Desert,
    Forest,
    Highland,
    Mountain,
    Aquatic,
    Ruin,
    Savanna,
    Snowfield,
    Special,
    Unique,
    Swamp,
    Volcano
}

// to easily get the name of the enum, used for translations keys
export namespace Biomes {
    export const enumName: string = "Biomes"
}