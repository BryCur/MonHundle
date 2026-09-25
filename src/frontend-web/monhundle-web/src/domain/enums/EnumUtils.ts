/**
 * Runtime shape of a reverse numeric enum: `value -> 'Name'`
 */
export type NumericEnum = Record<number, string>;

/** A numeric enum merged with a namespace exposing its name, used to build translation keys. */
export type NamedEnum = NumericEnum & { enumName: string };

export function enumValueToKeyLower(enumType: NumericEnum, value: number): string | undefined {
    const key = enumType[value]; // ex: "Higher"
    if (typeof key !== 'string') return undefined;
    return key.toLowerCase();
}
