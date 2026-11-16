export interface Placement {
  readonly x: number;
  readonly z: number;
  /** Turn around the vertical axis, in radians. */
  readonly rotation: number;
}

/**
 * A random number generator that always gives the same sequence for the same seed
 * (Math.random() can't do that). This is the "mulberry32" algorithm.
 */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turns a text (like "pepperoni") into a number we can use as a seed. */
export function hashString(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

/**
 * Spreads `count` pieces over a circle of `radius`, trying to keep them `minDistance` apart.
 * The same id always gives the same layout, so the pizza never "jumps" when redrawn.
 */
export function scatterPieces(id: string, count: number, radius: number, minDistance: number): Placement[] {
  const random = seededRandom(hashString(id));
  const placements: Placement[] = [];
  const maxTries = 30;

  for (let i = 0; i < count; i++) {
    let candidate = randomPointInCircle(random, radius);
    for (let attempt = 0; attempt < maxTries && isTooClose(candidate, placements, minDistance); attempt++) {
      candidate = randomPointInCircle(random, radius);
    }
    placements.push({ ...candidate, rotation: random() * Math.PI * 2 });
  }

  return placements;
}

function randomPointInCircle(random: () => number, radius: number): { x: number; z: number } {
  // The square root keeps pieces evenly spread instead of bunching up in the middle.
  const distance = Math.sqrt(random()) * radius;
  const angle = random() * Math.PI * 2;
  return { x: Math.cos(angle) * distance, z: Math.sin(angle) * distance };
}

function isTooClose(point: { x: number; z: number }, others: readonly Placement[], minDistance: number): boolean {
  return others.some((other) => Math.hypot(other.x - point.x, other.z - point.z) < minDistance);
}
