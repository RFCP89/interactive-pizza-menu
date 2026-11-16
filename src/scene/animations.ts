export interface Animation {
  /** Moves the animation forward. Returns true when it has finished. */
  tick(deltaSeconds: number): boolean;
}

/** Keeps a list of running animations and moves them all forward every frame. */
export function createAnimator() {
  let running: Animation[] = [];
  return {
    add(animation: Animation) {
      running.push(animation);
    },
    tick(deltaSeconds: number) {
      running = running.filter((animation) => !animation.tick(deltaSeconds));
    },
  };
}

export interface DropOptions {
  readonly count: number;
  /** Called for every piece with how high above its resting place it should be (0 = landed). */
  readonly setLift: (index: number, lift: number) => void;
  /** Called once per frame after all pieces were moved. */
  readonly commit: () => void;
  /** Stops early if this returns false (e.g. the topping was removed mid-fall). */
  readonly isAlive: () => boolean;
}

const DROP_HEIGHT = 1.4;
const DROP_SECONDS = 0.55;
const STAGGER_SECONDS = 0.035;

/** Pieces fall one after another from above the pizza and bounce a little when they land. */
export function dropAnimation({ count, setLift, commit, isAlive }: DropOptions): Animation {
  let elapsed = 0;
  const totalSeconds = DROP_SECONDS + STAGGER_SECONDS * (count - 1);

  const apply = () => {
    for (let i = 0; i < count; i++) {
      const progress = clamp01((elapsed - i * STAGGER_SECONDS) / DROP_SECONDS);
      setLift(i, (1 - easeOutBounce(progress)) * DROP_HEIGHT);
    }
    commit();
  };

  apply(); // start with every piece up in the air
  return {
    tick(deltaSeconds) {
      if (!isAlive()) {
        return true;
      }
      elapsed += deltaSeconds;
      apply();
      return elapsed >= totalSeconds;
    },
  };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Standard "bounce" easing: fast fall, then two small hops. */
function easeOutBounce(t: number): number {
  const n = 7.5625;
  const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t - 1.5 / d) * (t - 1.5 / d) + 0.75;
  if (t < 2.5 / d) return n * (t - 2.25 / d) * (t - 2.25 / d) + 0.9375;
  return n * (t - 2.625 / d) * (t - 2.625 / d) + 0.984375;
}
