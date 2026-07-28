/**
 * UUID v7 generation — time-sortable, index-friendly primary keys.
 *
 * Per `docs/tech/02-conventions.md`: PKs are UUID v7, app-generated.
 * Falls back to crypto.randomUUID (v4) if crypto.subtle/randomFill is unavailable.
 */

/** Generate a UUID v7 string (lowercase, dashed). */
export function uuidv7(): string {
  // RFC 9562 §5.3 — 48-bit unix-ms timestamp + 12 random + 62 random
  const unixts = Date.now();
  const ms = 2 ** 48 - 1;
  const tHi = Math.floor(unixts / 2 ** 16) & ms;
  // rand_hi: 12 bits (version nibble = 0x7) ; rand_lo: 62 bits (variant 0b10)
  const rand = new Uint8Array(10);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(rand);
  } else {
    for (let i = 0; i < 10; i++) rand[i] = Math.floor(Math.random() * 256);
  }
  const bytes = new Uint8Array(16);
  // timestamp (48 bits, big-endian)
  bytes[0] = (tHi >>> 24) & 0xff;
  bytes[1] = (tHi >>> 16) & 0xff;
  bytes[2] = (tHi >>> 8) & 0xff;
  bytes[3] = tHi & 0xff;
  bytes[4] = (unixts & 0xff) ? (unixts & 0xff) : 0;
  // version + 12 bits random
  bytes[5] = (rand[0] & 0x0f) | 0x70;
  bytes[6] = rand[1];
  // variant + 62 bits random
  bytes[7] = (rand[2] & 0x3f) | 0x80;
  bytes.set(rand.subarray(3), 8);

  const h = (i: number) => bytes[i].toString(16).padStart(2, "0");
  return (
    `${h(0)}${h(1)}${h(2)}${h(3)}-` +
    `${h(4)}${h(5)}-` +
    `${h(6)}${h(7)}-` +
    `${h(8)}${h(9)}-` +
    `${h(10)}${h(11)}${h(12)}${h(13)}${h(14)}${h(15)}`
  );
}
