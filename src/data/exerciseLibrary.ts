import { Exercise, MuscleTag } from "./types";

let _id = 0;
const next = () => `ex_${++_id}`;

const ex = (
  name: string,
  sets: number,
  reps: string,
  tags: MuscleTag[],
  extra: Partial<Exercise> = {}
): Exercise => ({
  id: next(),
  name,
  sets,
  reps,
  tags,
  ...extra,
});

// Reusable templates — IDs regenerated each call so logs stay distinct per session.
export const lib = {
  // Warmup / mobility
  carsShoulders: () =>
    ex("Shoulder CARs", 1, "5/side", ["shoulders"], {
      notes: "Slow controlled, max range",
    }),
  carsHips: () => ex("Hip CARs", 1, "5/side", ["legs"], { notes: "Slow" }),
  catCow: () => ex("Cat-Cow", 1, "10", ["core"], { notes: "Smooth flow" }),
  thoracicOpener: () =>
    ex("Thoracic opener (foam roller)", 1, "8", ["back"], {
      notes: "Stretch upper back",
    }),
  deadBug: () =>
    ex("Dead Bug", 2, "8/side", ["core"], {
      notes: "Anti-extension, low back flat",
    }),
  birdDog: () =>
    ex("Bird Dog", 2, "8/side", ["core", "back"], {
      notes: "Contralateral stability",
    }),
  hipFlexorStretch: () =>
    ex("Hip flexor stretch", 1, "30s/side", ["legs"], {}),

  // Plyo / power
  medBallSlam: () =>
    ex("Med Ball Slam", 4, "5", ["full_body"], {
      rest: "60s",
      loadHint: "explosive",
    }),
  boxJump: () =>
    ex("Box Jump", 4, "3", ["legs"], { rest: "90s", loadHint: "max intent" }),
  broadJump: () =>
    ex("Broad Jump", 4, "3", ["legs"], { rest: "90s" }),

  // Strength — back / shoulders priority
  pullup: () =>
    ex("Weighted Pull-up", 4, "5-6", ["back"], {
      loadHint: "RPE 8",
      rest: "150s",
      substitution: "Lat pulldown",
    }),
  chestSupportedRow: () =>
    ex("Chest-Supported Row", 4, "8-10", ["back", "shoulders"], {
      loadHint: "RPE 8",
      rest: "120s",
    }),
  oneArmRow: () =>
    ex("One-Arm DB Row", 4, "10/side", ["back"], {
      loadHint: "RPE 8",
      rest: "90s",
    }),
  facePull: () =>
    ex("Face Pull", 3, "12-15", ["shoulders", "back"], {
      loadHint: "RPE 7",
      rest: "60s",
    }),
  ohp: () =>
    ex("Overhead Press", 4, "5-6", ["shoulders"], {
      loadHint: "RPE 8",
      rest: "150s",
    }),
  dbShoulderPress: () =>
    ex("DB Shoulder Press", 4, "8-10", ["shoulders"], {
      rest: "90s",
      loadHint: "RPE 8",
    }),
  lateralRaise: () =>
    ex("Lateral Raise", 3, "12-15", ["shoulders"], {
      rest: "60s",
      loadHint: "RPE 8",
    }),
  rearDeltFly: () =>
    ex("Rear Delt Fly", 3, "12-15", ["shoulders", "back"], { rest: "45s" }),
  trapShrug: () =>
    ex("DB Shrug", 3, "12", ["shoulders", "back"], { rest: "45s" }),
  pullover: () =>
    ex("DB Pullover", 3, "10-12", ["back", "chest"], { rest: "60s" }),

  // Lower / posterior — low-back-aware
  hipThrust: () =>
    ex("Hip Thrust", 4, "8-10", ["posterior_chain", "legs"], {
      loadHint: "RPE 7",
      rest: "120s",
      notes: "Low-back-friendly hinge alternative",
    }),
  rdl: () =>
    ex("DB Romanian Deadlift", 3, "8-10", ["posterior_chain"], {
      loadHint: "RPE 7",
      rest: "120s",
      notes: "Stop if low back > 3/10",
    }),
  splitSquat: () =>
    ex("Bulgarian Split Squat", 3, "8/side", ["legs"], {
      loadHint: "RPE 8",
      rest: "90s",
    }),
  reverseLunge: () =>
    ex("Reverse Lunge", 3, "8/side", ["legs"], { rest: "90s" }),
  gobletSquat: () =>
    ex("Goblet Squat", 3, "10", ["legs"], { rest: "90s" }),

  // Carries / grip / core (BJJ-relevant)
  farmerCarry: () =>
    ex("Farmer Carry", 3, "30m", ["grip", "core"], {
      rest: "75s",
      loadHint: "heavy",
    }),
  suitcaseCarry: () =>
    ex("Suitcase Carry", 3, "20m/side", ["core", "grip"], { rest: "60s" }),
  pallofPress: () =>
    ex("Pallof Press", 3, "10/side", ["core"], { rest: "45s" }),
  hangingLegRaise: () =>
    ex("Hanging Leg Raise", 3, "8-10", ["core", "grip"], { rest: "60s" }),

  // Conditioning fillers used inside sessions
  rower: () =>
    ex("Row machine", 1, "10 min Z2", ["full_body"], {
      notes: "Nasal breathing if possible",
    }),
  airBike: () =>
    ex("Air bike intervals", 6, "30s on / 90s off", ["full_body"], {
      loadHint: "high",
    }),
};

export type LibKey = keyof typeof lib;
