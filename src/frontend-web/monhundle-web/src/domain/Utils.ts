

export type UUID = string & { __uuid: void };

const UUID_REGEX = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

// type guard to assert a string is a valid uuid
export function isUUID(uuid: string): uuid is UUID {
  return UUID_REGEX.test(uuid);
}

export function msUntilMidnightUTC(): number {
  const now = new Date();
  const midnightUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return midnightUTC.getTime() - now.getTime();
}