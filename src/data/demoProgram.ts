import { lib } from "./exerciseLibrary";
import { buildWeeklyPlan, applyPlanToDays } from "./scheduler";
import {
  Day,
  Phase,
  Program,
  ScheduleSettings,
  Session,
  SessionType,
  Week,
  Weekday,
} from "./types";

let _sid = 0;
const sid = () => `s_${++_sid}`;

/* -----------------------------------------------------------
 * Session templates
 * Inspired by Joel Jamieson (energy systems, base aérobie),
 * Phil Daru (warmup → plyo → strength → corrective → conditioning),
 * Ground Control (trunk + contralateral stability),
 * FRC (CARs, end-range control).
 * --------------------------------------------------------- */

function strengthMain(weekIdx: number): Session {
  // Progressive overload across phases will be reflected via reps/sets ranges
  // but we keep the template stable; logging captures actual loads.
  return {
    id: sid(),
    type: "strength",
    title: "Force — Dos / Épaules (principale)",
    focus: "Tirages lourds, presse verticale, accent dos & épaules",
    durationMin: 75,
    blocks: [
      {
        id: sid(),
        type: "warmup",
        title: "Warmup",
        exercises: [lib.carsShoulders(), lib.thoracicOpener(), lib.catCow()],
      },
      {
        id: sid(),
        type: "plyometrics",
        title: "Power primer",
        exercises: [lib.medBallSlam()],
      },
      {
        id: sid(),
        type: "strength",
        title: "Bloc principal",
        exercises: [
          lib.pullup(),
          lib.ohp(),
          lib.chestSupportedRow(),
          lib.dbShoulderPress(),
        ],
      },
      {
        id: sid(),
        type: "strength",
        title: "Accessoires",
        exercises: [lib.facePull(), lib.lateralRaise(), lib.pullover()],
      },
      {
        id: sid(),
        type: "corrective",
        title: "Correctif / core",
        exercises: [lib.deadBug(), lib.pallofPress()],
      },
    ],
  };
}

function strengthSecondary(): Session {
  return {
    id: sid(),
    type: "strength",
    title: "Force — Posterior chain & core",
    focus: "Hinge prudent, unilatéral, carries, core anti-extension",
    durationMin: 60,
    blocks: [
      {
        id: sid(),
        type: "warmup",
        title: "Warmup",
        exercises: [lib.carsHips(), lib.hipFlexorStretch(), lib.birdDog()],
      },
      {
        id: sid(),
        type: "plyometrics",
        title: "Power",
        exercises: [lib.broadJump()],
      },
      {
        id: sid(),
        type: "strength",
        title: "Bloc principal",
        exercises: [lib.hipThrust(), lib.splitSquat(), lib.oneArmRow()],
      },
      {
        id: sid(),
        type: "strength",
        title: "Carries & core",
        exercises: [lib.farmerCarry(), lib.suitcaseCarry(), lib.hangingLegRaise()],
      },
      {
        id: sid(),
        type: "corrective",
        title: "Correctif",
        exercises: [lib.rearDeltFly(), lib.pallofPress()],
      },
    ],
  };
}

function conditioningZ2(): Session {
  return {
    id: sid(),
    type: "conditioning",
    title: "Conditioning — Zone 2",
    focus: "Cardiac output / base aérobie (Joel Jamieson)",
    durationMin: 50,
    conditioning: {
      type: "zone2",
      targetMin: 45,
      targetHRZone: "Z2 (130-150 bpm)",
      description:
        "Vélo, rameur ou course à allure conversationnelle. Nasal breathing si possible. 45 min continu.",
    },
    blocks: [
      {
        id: sid(),
        type: "warmup",
        title: "Activation",
        exercises: [lib.carsShoulders(), lib.carsHips()],
      },
      {
        id: sid(),
        type: "conditioning",
        title: "Z2 continu",
        exercises: [
          {
            ...lib.rower(),
            sets: 1,
            reps: "45 min Z2",
            notes: "Allure conversationnelle, FC stable",
          },
        ],
      },
    ],
  };
}

function conditioningThreshold(): Session {
  return {
    id: sid(),
    type: "conditioning",
    title: "Threshold / Intervalles",
    focus: "Anaérobie lactique — capacité",
    durationMin: 40,
    conditioning: {
      type: "threshold",
      targetMin: 30,
      targetHRZone: "Threshold ~85% FCmax",
      description:
        "6 × 30s on / 90s off air bike ou rameur. Effort ~RPE 8.",
    },
    blocks: [
      {
        id: sid(),
        type: "warmup",
        title: "Warmup progressif",
        exercises: [lib.rower()],
      },
      {
        id: sid(),
        type: "conditioning",
        title: "Intervalles",
        exercises: [lib.airBike()],
      },
      {
        id: sid(),
        type: "cooldown",
        title: "Retour au calme",
        exercises: [lib.catCow(), lib.thoracicOpener()],
      },
    ],
  };
}

function mobilityRecovery(): Session {
  return {
    id: sid(),
    type: "mobility",
    title: "Mobilité / Récupération active",
    focus: "CARs, end-range holds, soutien JJB (FRC)",
    durationMin: 30,
    blocks: [
      {
        id: sid(),
        type: "mobility",
        title: "CARs full body",
        exercises: [lib.carsShoulders(), lib.carsHips()],
      },
      {
        id: sid(),
        type: "mobility",
        title: "End range / stabilité",
        exercises: [lib.deadBug(), lib.birdDog(), lib.pallofPress()],
      },
      {
        id: sid(),
        type: "cooldown",
        title: "Décompression",
        exercises: [lib.catCow(), lib.hipFlexorStretch()],
      },
    ],
  };
}

function jjbSession(): Session {
  return {
    id: sid(),
    type: "jjb",
    title: "JJB",
    focus: "Sparring & technique — priorité performance",
    durationMin: 90,
    conditioning: {
      type: "jjb_roll",
      targetMin: 30,
      description: "Notez la durée de sparring et le RPE global.",
    },
    blocks: [
      {
        id: sid(),
        type: "warmup",
        title: "Warmup pré-tatamis",
        exercises: [lib.carsShoulders(), lib.carsHips(), lib.catCow()],
      },
    ],
  };
}

/* -----------------------------------------------------------
 * Phase configs — 12 weeks total, 3 phases of 4 weeks
 * --------------------------------------------------------- */

const PHASES: Array<{ name: string; goal: string; weekFocus: (w: number) => string }> = [
  {
    name: "Phase 1 — Base aérobie & force générale",
    goal: "Construire la base aérobie (cardiac output) et restaurer la force utile. Volume modéré, RPE 7-8.",
    weekFocus: (w) =>
      `Semaine ${w} — accent Z2, hypertrophie dos/épaules, hinge prudent`,
  },
  {
    name: "Phase 2 — Force maximale & threshold",
    goal: "Monter la force maximale (RPE 8-9, reps plus basses) et introduire le threshold.",
    weekFocus: (w) =>
      `Semaine ${w} — force max, threshold intervals, maintien Z2`,
  },
  {
    name: "Phase 3 — Puissance & cardiac power",
    goal: "Vitesse-force, cardiac power intervals, transfert vers performance JJB.",
    weekFocus: (w) =>
      `Semaine ${w} — power, cardiac power, peaking JJB`,
  },
];

function buildSessionsByType(): Record<SessionType, Session | undefined> {
  return {
    strength: strengthMain(1),
    conditioning: conditioningZ2(),
    mobility: mobilityRecovery(),
    jjb: jjbSession(),
    recovery: mobilityRecovery(),
    rest: undefined,
  };
}

export function buildDemoProgram(settings: ScheduleSettings): Program {
  const phases: Phase[] = [];
  let weekCounter = 0;

  for (let pi = 0; pi < 3; pi++) {
    const cfg = PHASES[pi];
    const weeks: Week[] = [];

    for (let wi = 0; wi < 4; wi++) {
      weekCounter++;
      const days: Day[] = [];
      for (let d = 0; d < 7; d++) {
        days.push({
          id: `p${pi + 1}-w${wi + 1}-d${d}`,
          weekday: d as Weekday,
        });
      }

      // Distinct templates per session type so logs separate cleanly per week
      // (we rebuild templates per week to vary internal IDs).
      const sessionsByType: Record<SessionType, Session | undefined> = {
        strength:
          (wi % 2 === 0 ? strengthMain(weekCounter) : strengthSecondary()),
        conditioning:
          (pi === 0 ? conditioningZ2() : conditioningThreshold()),
        mobility: mobilityRecovery(),
        jjb: jjbSession(),
        recovery: mobilityRecovery(),
        rest: undefined,
      };

      // Use scheduler to position blocks on weekdays
      const plan = buildWeeklyPlan(settings);
      const planned = applyPlanToDays(days, plan, sessionsByType);

      // Inject a 2nd S&C/Conditioning if configured (re-run scheduler keeps it deterministic)
      // The scheduler already places multiple S&C / conditioning when count >= 2.

      weeks.push({
        id: `p${pi + 1}-w${wi + 1}`,
        index: weekCounter,
        focus: cfg.weekFocus(weekCounter),
        days: planned,
      });
    }

    phases.push({
      id: `p${pi + 1}`,
      index: pi + 1,
      name: cfg.name,
      goal: cfg.goal,
      weeks,
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  return {
    id: "prog_main",
    name: "Préparation JJB — Cycle 12 semaines",
    goal: "Cardio élevé pour le JJB, dos & épaules prioritaires, perte de gras sans devenir skinny.",
    startDate: today,
    phases,
  };
}

export const DEFAULT_SETTINGS: ScheduleSettings = {
  jjbSlots: [
    { weekday: 0, dayPart: "evening" }, // Lundi soir
    { weekday: 3, dayPart: "midday" }, // Jeudi midi
  ],
  scStrengthCount: 2,
  conditioningCount: 2,
  recoveryCount: 1,
  lowBackCaution: true,
};

/* -----------------------------------------------------------
 * Demo logs — readiness + a couple of session/conditioning logs
 * --------------------------------------------------------- */

import { ConditioningLog, ReadinessLog, SessionLog } from "./types";

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function buildDemoReadiness(): ReadinessLog[] {
  const logs: ReadinessLog[] = [];
  const w = 78.5;
  for (let i = 13; i >= 0; i--) {
    logs.push({
      id: `rd_${i}`,
      date: isoDaysAgo(i),
      weightKg: +(w - i * 0.05 + (Math.random() - 0.5) * 0.4).toFixed(1),
      sleepHours: +(7 + (Math.random() - 0.5)).toFixed(1),
      sleepQuality: 3 + Math.round(Math.random()),
      fatigue: 2 + Math.round(Math.random() * 2),
      energy: 3 + Math.round(Math.random()),
      soreness: 2 + Math.round(Math.random() * 2),
      lowBackPain: i % 4 === 0 ? 3 : 1,
      motivation: 3 + Math.round(Math.random()),
    });
  }
  return logs;
}

export function buildDemoConditioning(): ConditioningLog[] {
  return [
    { id: "c1", date: isoDaysAgo(2), type: "zone2", durationMin: 45, rpe: 5 },
    { id: "c2", date: isoDaysAgo(5), type: "threshold", durationMin: 28, rpe: 8 },
    { id: "c3", date: isoDaysAgo(7), type: "jjb_roll", durationMin: 35, rpe: 8 },
    { id: "c4", date: isoDaysAgo(9), type: "zone2", durationMin: 40, rpe: 5 },
    { id: "c5", date: isoDaysAgo(11), type: "jjb_roll", durationMin: 30, rpe: 7 },
  ];
}

export function buildDemoSessionLogs(): SessionLog[] {
  return [
    {
      id: "sl1",
      date: isoDaysAgo(2),
      sessionId: "demo",
      sessionTitle: "Force — Dos / Épaules",
      type: "strength",
      completed: true,
      durationMin: 70,
      rpe: 7,
      exercises: [
        {
          exerciseId: "demo1",
          name: "Weighted Pull-up",
          sets: [
            { reps: 6, load: 10, rpe: 7, done: true },
            { reps: 5, load: 12, rpe: 8, done: true },
            { reps: 5, load: 12, rpe: 8, done: true },
            { reps: 4, load: 12, rpe: 9, done: true },
          ],
        },
        {
          exerciseId: "demo2",
          name: "Overhead Press",
          sets: [
            { reps: 6, load: 50, rpe: 7, done: true },
            { reps: 5, load: 55, rpe: 8, done: true },
            { reps: 5, load: 55, rpe: 8, done: true },
            { reps: 4, load: 55, rpe: 9, done: true },
          ],
        },
      ],
    },
  ];
}
