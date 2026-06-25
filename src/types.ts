export interface RoboponData {
    id: number;
    name: string;
    description: string;
    type: RoboponType;
    weight: RoboponWeight;
    size: RoboponSize;
    maxLevel: number;
    expCurve: number;
    minStats: StatList<number>;
    statGrowth: StatList<number>;
    maxStats: {
        acquired?: StatList<number>;
        enhanced?: StatList<number>;
    };

    software: { name: string; level: number }[];
    special?: string[];

    vulnerability: Vulnerability;
    enhances?: { name: string; level: number };
    obtain: ObtainMethod[];
    linkSpark: SparkRecipe[];

    drop?: { name: string; percent: number }[];
    steal?: { name: string; percent: number }[];
}

export type RoboponType = ArmType | BootType | MoveType;

export interface ArmType {
    type: "ARM";
    subType: "NIGHT" | "FGT" | "HEALR" | "SORCR" | "PUNCH" | "DEVIL" | "GUNNR" | "THIEF";
    oilType: OilType;
}

export interface BootType {
    type: "BOOT";
    subType: "MAT" | "HUMAN" | "MNSTR" | "ANIMA"
    oilType: OilType;
}

export interface MoveType {
    type: "MOVE";
    subType: "SKY" | "SEA" | "LAND";
    oilType: OilType;
}

export interface StatList<U> {
    HP: U;
    EP: U;
    ATK: U;
    DEF: U;
    SPD: U;
    FOR: U;
    WIL: U;
}

export interface Vulnerability {
    Ice: number;
    Fire: number;
    Rock: number;
    Wind: number;
    Zap: number;
    Status: number;
}

export interface SparkRecipe {
    level: number;
    batteries: string[];
    version?: GameVersion;
}

type ObtainMethod = ObtainUnknown | ObtainEnhance | ObtainSpark | ObtainFossil | ObtainPassword | ObtainMistake;

export interface ObtainUnknown {
    method: "unknown";
}

export interface ObtainEnhance {
    method: "enhance";
}

export interface ObtainSpark extends SparkRecipe {
    method: "spark";
}

export interface ObtainFossil {
    method: "fossil";
    location: string;
    version?: GameVersion;
}

export interface ObtainPassword {
    method: "password";
    password: string;
}

export interface ObtainMistake {
    method: "mistake";
    version: GameVersion;
}

export interface StatRangeData {
    min: number;
    max: number;
    sum: number;
}

export type RoboponWeight = "LIGHT" | "NORM" | "HEAV" | "VHEV" | "VLIG";
export type RoboponSize = "NORM" | "SMALL" | "LARGE" | "TINY" | "HUGE";
export type GameVersion = "ring" | "cross";
export type OilType = "A" | "B" | "AB" | "O" | "?";