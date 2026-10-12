/*
 * ULIDs, generated in code (spec §3 Phase 3 step 2). Lexicographically sortable
 * by creation time, which keeps `ORDER BY id` meaningful without trusting the
 * clock in SQL.
 *
 * 48-bit timestamp (ms) + 80 bits of randomness, Crockford base32, 26 chars.
 */

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const TIME_LENGTH = 10
const RANDOM_LENGTH = 16

export function ulid(now: number = Date.now()): string {
  let time = ''
  let remaining = now

  for (let i = TIME_LENGTH - 1; i >= 0; i -= 1) {
    time = ENCODING[remaining % 32] + time
    remaining = Math.floor(remaining / 32)
  }

  return time + randomPart()
}

function randomPart(): string {
  const bytes = new Uint8Array(RANDOM_LENGTH)
  crypto.getRandomValues(bytes)

  let out = ''
  for (const byte of bytes) {
    // 32 symbols per character, so the low 5 bits of each byte are enough.
    out += ENCODING[byte % 32]
  }
  return out
}

/** A media id: `med_` + ULID (spec §3 Phase 3 `media` table). */
export function mediaId(): string {
  return `med_${ulid()}`
}

/** A generic record id. */
export function newId(): string {
  return ulid()
}
