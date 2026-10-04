const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// URL ids can be anything; Postgres errors on non-UUIDs, so treat them as "not found".
export function isUuid(value: string): boolean {
  return UUID.test(value);
}
