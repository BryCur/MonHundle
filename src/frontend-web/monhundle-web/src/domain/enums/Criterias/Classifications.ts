export enum Classifications { 
    Amphibian,
    BirdWyvern,
    BruteWyvern,
    Carapaceon,
    Cephalopod,
    Construct,
    DemiElder,
    ElderDragon,
    FangedBeast,
    FangedWyvern,
    FlyingWyvern,
    Leviathan,
    Lynian,
    Neopteron,
    PiscineWyvern,
    Relict,
    SnakeWyvern,
    Temnoceran,
    Unknown,
}

// to easily get the name of the enum, used for translations keys
export namespace Classifications {
    export const enumName: string = "Classifications"
}