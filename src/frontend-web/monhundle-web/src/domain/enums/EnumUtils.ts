import { enumNames } from '@/domain/ApiModels';

/**
 * Runtime shape of a reverse numeric enum: `value -> 'Name'`
 */
export type NumericEnum = Record<number, string>;

/** Name of a generated enum (e.g. `'Weaknesses'`), looked up in the generated registry. */
export function getEnumName(enumType: NumericEnum): string | undefined {
    return enumNames.get(enumType);
}

/** A numeric enum merged with a namespace exposing its name, used to build translation keys. */
export type NamedEnum = NumericEnum & { enumName: string };

export function enumValueToKeyLower(enumType: NumericEnum, value: number): string | undefined {
    const key = enumType[value]; // ex: "Higher"
    if (typeof key !== 'string') return undefined;
    return key.toLowerCase();
}
