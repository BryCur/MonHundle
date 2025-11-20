export function enumValueToKeyLower(
  enumType: any,
  value: number
): string | undefined {
  const key = enumType[value]; // ex: "Higher"
  if (typeof key !== 'string') return undefined;
  return key.toLowerCase();
}