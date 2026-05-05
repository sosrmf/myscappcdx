// Core domain model — JJB / S&C / Conditioning tracking app
// All IDs are strings. Dates are ISO yyyy-mm-dd unless stated otherwise.

export type SessionType =
  | "jjb"
  | "strength"
  | "conditioning"
  | "mobility"
  | "recovery"
  | "rest";

export type ConditioningType =
  | "zone2"
  | "threshold"
  | "intervals"
  | "cardiac_power"
  | "tempo"
  | "high_resistance"
  | "jjb_roll";

export type BlockType =
  | "warmup"
  | "mobility"
  | "plyometrics"
  | "strength"
  | "corrective"
  | "conditioning"
  | "cooldown";

export type MuscleTag =
  | "back"
  | "shoulders"
  | "chest"
  | "legs"
  | "core"
  | "grip"
  | "posterior_chain"
  | "full_body";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // "8-10", "30s", "AMRAP"
  loadHint?: string; // "RPE 7", "BW", "moderate"
  rest?: string; // "90s"
  tempo?: string; // "3-1-1-0"
  notes?: string;
  tags: MuscleTag[];
  substitution?: string;
}

export interface SessionBlock {
  id: string;
  type: BlockType;
  title: string;
  exercises: Exercise[];
}

export interface Session {
  id: string;
  type: SessionType;
  title: string;
  focus: string; // "Back & Shoulders strength + posterior chain"
  durationMin: number;
  blocks: SessionBlock[];
  // For conditioning-only sessions:
  conditioning?: {
    type: ConditioningType;
    targetMin: number;
    targetHRZone?: string; // "Z2", "Threshold", "Z5"
    description: string;
  };
}

export interface Day {
  id: string; // phaseIdx-weekIdx-dayIdx
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = monday
  session?: Session; // undefined = rest
  isJJB?: boolean;
}

export interface Week {
  id: string;
  index: number; // 1..N
  focus: string;
  days: Day[];
}

export interface Phase {
  id: string;
  index: number; // 1..N
  name: string;
  goal: string;
  weeks: Week[];
}

export interface Program {
  id: string;
  name: string;
  goal: string;
  startDate: string; // yyyy-mm-dd
  phases: Phase[];
}

// ---- Logging models ----

export interface SetLog {
  reps?: number;
  load?: number; // kg
  rpe?: number; // 1-10
  done: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  name: string;
  sets: SetLog[];
  notes?: string;
  pain?: number; // 0-10
}

export interface SessionLog {
  id: string;
  date: string; // yyyy-mm-dd
  sessionId: string;
  sessionTitle: string;
  type: SessionType;
  exercises: ExerciseLog[];
  durationMin?: number;
  rpe?: number;
  notes?: string;
  completed: boolean;
}

export interface ConditioningLog {
  id: string;
  date: string;
  type: ConditioningType;
  durationMin: number;
  rpe?: number;
  avgHR?: number;
  notes?: string;
}

export interface ReadinessLog {
  id: string;
  date: string;
  weightKg?: number;
  sleepHours?: number;
  sleepQuality: number; // 1-5
  fatigue: number; // 1-5 (5 = exhausted)
  energy: number; // 1-5
  soreness: number; // 1-5
  lowBackPain: number; // 0-10
  motivation: number; // 1-5
  notes?: string;
}

export interface BodyMetricLog {
  id: string;
  date: string;
  weightKg?: number;
  waistCm?: number;
  notes?: string;
}

// ---- Settings ----

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type DayPart = "morning" | "midday" | "evening";

export interface JJBSlot {
  weekday: Weekday;
  dayPart: DayPart;
}

export interface ScheduleSettings {
  jjbSlots: JJBSlot[];
  scStrengthCount: number; // sessions per week
  conditioningCount: number; // sessions per week
  recoveryCount: number;
  lowBackCaution: boolean;
}

export interface AppSettings {
  unit: "kg" | "lb";
  theme: "dark"; // V1 dark only
  schedule: ScheduleSettings;
}

// ---- Coaching guidance ----

export type GuidanceLevel =
  | "push"
  | "normal"
  | "reduced_load"
  | "recovery_focus"
  | "caution";

export interface Guidance {
  level: GuidanceLevel;
  title: string;
  message: string;
  flags: string[];
}
