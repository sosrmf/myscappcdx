import { ConditioningLog, ReadinessLog, SessionLog } from "./types";

export function startOfWeek(d: Date = new Date()): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  // 0 = Sunday in JS; we want Monday as start
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  return copy;
}

function inThisWeek(iso: string): boolean {
  const d = new Date(iso);
  const start = startOfWeek();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return d >= start && d < end;
}

export function weeklyConditioningMinutes(logs: ConditioningLog[]): number {
  return logs
    .filter((l) => inThisWeek(l.date))
    .reduce((s, l) => s + l.durationMin, 0);
}

export function weeklyConditioningByType(
  logs: ConditioningLog[]
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const l of logs) {
    if (!inThisWeek(l.date)) continue;
    out[l.type] = (out[l.type] ?? 0) + l.durationMin;
  }
  return out;
}

export function weeklyCompletionRate(
  logs: SessionLog[],
  plannedThisWeek: number
): number {
  if (plannedThisWeek === 0) return 0;
  const done = logs.filter((l) => inThisWeek(l.date) && l.completed).length;
  return Math.min(1, done / plannedThisWeek);
}

export function weeklySessionsCount(logs: SessionLog[]): number {
  return logs.filter((l) => inThisWeek(l.date) && l.completed).length;
}

export function exerciseVolume(log: SessionLog): number {
  let v = 0;
  for (const e of log.exercises) {
    for (const s of e.sets) {
      if (s.done && s.reps && s.load) v += s.reps * s.load;
    }
  }
  return v;
}

export function weeklyVolume(logs: SessionLog[]): number {
  return logs
    .filter((l) => inThisWeek(l.date))
    .reduce((s, l) => s + exerciseVolume(l), 0);
}

export function topExercisesByVolume(
  logs: SessionLog[],
  limit = 5
): Array<{ name: string; volume: number }> {
  const map = new Map<string, number>();
  for (const log of logs) {
    for (const e of log.exercises) {
      let v = 0;
      for (const s of e.sets) {
        if (s.done && s.reps && s.load) v += s.reps * s.load;
      }
      map.set(e.name, (map.get(e.name) ?? 0) + v);
    }
  }
  return [...map.entries()]
    .map(([name, volume]) => ({ name, volume }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);
}

export function weightTrend(
  readinessLogs: ReadinessLog[]
): Array<{ date: string; weight: number }> {
  return readinessLogs
    .filter((r) => typeof r.weightKg === "number")
    .map((r) => ({ date: r.date, weight: r.weightKg as number }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function painTrend(
  readinessLogs: ReadinessLog[]
): Array<{ date: string; pain: number }> {
  return readinessLogs
    .map((r) => ({ date: r.date, pain: r.lowBackPain }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function readinessScore(r: ReadinessLog): number {
  // Higher = better. Range ~0..10
  const sleep = ((r.sleepHours ?? 6) / 9) * 2.5; // 0..2.5
  const sq = (r.sleepQuality / 5) * 1.5;
  const energy = (r.energy / 5) * 2;
  const fatigue = (1 - (r.fatigue - 1) / 4) * 1.5;
  const soreness = (1 - (r.soreness - 1) / 4) * 1;
  const pain = (1 - r.lowBackPain / 10) * 1.5;
  const motiv = (r.motivation / 5) * 1;
  return Math.max(0, Math.min(10, sleep + sq + energy + fatigue + soreness + pain + motiv));
}

export function readinessTrend(
  readinessLogs: ReadinessLog[]
): Array<{ date: string; score: number }> {
  return readinessLogs
    .map((r) => ({ date: r.date, score: +readinessScore(r).toFixed(2) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
