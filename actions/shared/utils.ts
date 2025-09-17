export function toBigInt(value: string | number | bigint): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.trunc(value));
  const num = Number(value);
  if (!Number.isFinite(num)) throw new Error("Invalid number");
  return BigInt(Math.trunc(num));
}

export function toDate(value: string | Date | undefined | null): Date | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

// Safely serialize BigInt fields and Date objects in objects/arrays for server action returns
export function serializeBigInt<T = any>(value: T): any {
  if (value === null || value === undefined) return value;

  const t = typeof value as string;

  // Handle BigInt
  if (t === "bigint") return (value as unknown as bigint).toString();

  // Handle Date objects
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Handle primitives
  if (t !== "object") return value;

  // Handle Arrays
  if (Array.isArray(value)) {
    return value.map((v) => serializeBigInt(v));
  }

  // Handle Objects
  const out: Record<string, any> = {};
  for (const key of Object.keys(value as Record<string, any>)) {
    out[key] = serializeBigInt((value as Record<string, any>)[key]);
  }
  return out;
}
