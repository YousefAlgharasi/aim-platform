// Small helpers for random question selection and answer-order shuffling.
//
// Two flavours:
//   - seeded:    deterministic for a given seed, used where the same student must see the same
//                order again after a reload/resume (e.g. option order inside one attempt).
//   - unseeded:  Math.random, used to draw a fresh set every time a new session/attempt starts.

/** xmur3 string hash -> 32-bit seed. */
function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 PRNG seeded from a string. Returns floats in [0, 1). */
export function seededRandom(seed: string): () => number {
  let a = hashSeed(seed);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle returning a new array. */
export function shuffled<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Draw `count` items, preferring those the student has seen least recently.
 *
 * `seenAt` maps item id -> last-seen epoch ms (absent = never seen). Never-seen items come first
 * (random among themselves), then seen items from least-recently to most-recently seen, so a student
 * keeps getting fresh questions until the pool is exhausted, then cycles through the oldest ones.
 * The returned selection is shuffled so the presentation order is random too.
 */
export function pickPreferringUnseen<T extends { id: string }>(
  pool: readonly T[],
  count: number,
  seenAt: ReadonlyMap<string, number>,
  rng: () => number = Math.random,
): T[] {
  if (pool.length <= count) return shuffled(pool, rng);
  const unseen = shuffled(
    pool.filter((p) => !seenAt.has(p.id)),
    rng,
  );
  const seen = shuffled(
    pool.filter((p) => seenAt.has(p.id)),
    rng,
  ).sort((a, b) => (seenAt.get(a.id) ?? 0) - (seenAt.get(b.id) ?? 0));
  return shuffled([...unseen, ...seen].slice(0, count), rng);
}
