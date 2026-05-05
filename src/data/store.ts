import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  AppSettings,
  BodyMetricLog,
  ConditioningLog,
  Day,
  Program,
  ReadinessLog,
  ScheduleSettings,
  SessionLog,
  Weekday,
} from "./types";
import {
  buildDemoProgram,
  buildDemoConditioning,
  buildDemoReadiness,
  buildDemoSessionLogs,
  DEFAULT_SETTINGS,
} from "./demoProgram";
import { applyPlanToDays, buildWeeklyPlan } from "./scheduler";

interface AppState {
  hydrated: boolean;
  program: Program;
  settings: AppSettings;
  sessionLogs: SessionLog[];
  conditioningLogs: ConditioningLog[];
  readinessLogs: ReadinessLog[];
  bodyMetricLogs: BodyMetricLog[];

  // Actions
  setHydrated: (v: boolean) => void;
  rebuildProgram: () => void;
  updateSchedule: (s: Partial<ScheduleSettings>) => void;
  setUnit: (u: "kg" | "lb") => void;

  upsertReadiness: (log: ReadinessLog) => void;
  upsertSessionLog: (log: SessionLog) => void;
  upsertConditioning: (log: ConditioningLog) => void;
  upsertBodyMetric: (log: BodyMetricLog) => void;

  resetDemoData: () => void;
  clearAllData: () => void;
}

const initialSettings: AppSettings = {
  unit: "kg",
  theme: "dark",
  schedule: DEFAULT_SETTINGS,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      program: buildDemoProgram(DEFAULT_SETTINGS),
      settings: initialSettings,
      sessionLogs: buildDemoSessionLogs(),
      conditioningLogs: buildDemoConditioning(),
      readinessLogs: buildDemoReadiness(),
      bodyMetricLogs: [],

      setHydrated: (v) => set({ hydrated: v }),

      rebuildProgram: () => {
        const { settings } = get();
        const program = buildDemoProgram(settings.schedule);
        set({ program });
      },

      updateSchedule: (s) => {
        const next = { ...get().settings.schedule, ...s };
        set({ settings: { ...get().settings, schedule: next } });
        // Regenerate plan layout while keeping logs untouched
        get().rebuildProgram();
      },

      setUnit: (u) => set({ settings: { ...get().settings, unit: u } }),

      upsertReadiness: (log) => {
        const others = get().readinessLogs.filter((r) => r.date !== log.date);
        set({ readinessLogs: [...others, log] });
      },
      upsertSessionLog: (log) => {
        const others = get().sessionLogs.filter((s) => s.id !== log.id);
        set({ sessionLogs: [...others, log] });
      },
      upsertConditioning: (log) => {
        const others = get().conditioningLogs.filter((c) => c.id !== log.id);
        set({ conditioningLogs: [...others, log] });
      },
      upsertBodyMetric: (log) => {
        const others = get().bodyMetricLogs.filter((b) => b.id !== log.id);
        set({ bodyMetricLogs: [...others, log] });
      },

      resetDemoData: () => {
        set({
          program: buildDemoProgram(get().settings.schedule),
          sessionLogs: buildDemoSessionLogs(),
          conditioningLogs: buildDemoConditioning(),
          readinessLogs: buildDemoReadiness(),
          bodyMetricLogs: [],
        });
      },

      clearAllData: () => {
        set({
          sessionLogs: [],
          conditioningLogs: [],
          readinessLogs: [],
          bodyMetricLogs: [],
        });
      },
    }),
    {
      name: "myscappcdx-state-v1",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      // Don't persist the program — it's deterministically rebuilt from settings
      partialize: (s) => ({
        settings: s.settings,
        sessionLogs: s.sessionLogs,
        conditioningLogs: s.conditioningLogs,
        readinessLogs: s.readinessLogs,
        bodyMetricLogs: s.bodyMetricLogs,
      }),
    }
  )
);

/* -----------------------------------------------------------
 * Selectors
 * --------------------------------------------------------- */

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function todayWeekday(): Weekday {
  // Map JS Sunday=0 to our Monday=0 model
  const js = new Date().getDay();
  return ((js + 6) % 7) as Weekday;
}

export function getCurrentWeek(program: Program): {
  phaseIndex: number;
  weekIndex: number;
} {
  const start = new Date(program.startDate);
  const now = new Date();
  const diffDays = Math.max(
    0,
    Math.floor((now.getTime() - start.getTime()) / (24 * 3600 * 1000))
  );
  const weekIdx0 = Math.min(diffDays / 7, 12 - 0.0001) | 0;
  const phaseIdx = Math.floor(weekIdx0 / 4);
  return { phaseIndex: phaseIdx, weekIndex: weekIdx0 % 4 };
}

export function getTodayDay(program: Program): Day | undefined {
  const { phaseIndex, weekIndex } = getCurrentWeek(program);
  const phase = program.phases[phaseIndex];
  if (!phase) return undefined;
  const week = phase.weeks[weekIndex];
  if (!week) return undefined;
  const wd = todayWeekday();
  return week.days.find((d) => d.weekday === wd);
}

export function getCurrentWeekDays(program: Program): Day[] {
  const { phaseIndex, weekIndex } = getCurrentWeek(program);
  return program.phases[phaseIndex]?.weeks[weekIndex]?.days ?? [];
}
