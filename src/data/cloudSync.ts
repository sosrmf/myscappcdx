// Cloud sync — offline-first.
// Stratégie : last-write-wins par ligne (updated_at côté serveur).
// L'app fonctionne 100 % localement ; la synchro est best-effort.

import {
  BodyMetricLog,
  ConditioningLog,
  ReadinessLog,
  SessionLog,
} from "./types";
import { supabase, SUPABASE_CONFIGURED } from "./supabase";

/* -------- Mapping camelCase ↔ snake_case -------- */

function sessionLogToRow(log: SessionLog, userId: string) {
  return {
    id: log.id,
    user_id: userId,
    date: log.date,
    session_id: log.sessionId,
    session_title: log.sessionTitle,
    type: log.type,
    exercises: log.exercises,
    duration_min: log.durationMin ?? null,
    rpe: log.rpe ?? null,
    notes: log.notes ?? null,
    completed: log.completed,
  };
}
function rowToSessionLog(r: any): SessionLog {
  return {
    id: r.id,
    date: r.date,
    sessionId: r.session_id,
    sessionTitle: r.session_title,
    type: r.type,
    exercises: r.exercises ?? [],
    durationMin: r.duration_min ?? undefined,
    rpe: r.rpe ?? undefined,
    notes: r.notes ?? undefined,
    completed: r.completed,
  };
}

function condToRow(l: ConditioningLog, userId: string) {
  return {
    id: l.id,
    user_id: userId,
    date: l.date,
    type: l.type,
    duration_min: l.durationMin,
    rpe: l.rpe ?? null,
    avg_hr: l.avgHR ?? null,
    notes: l.notes ?? null,
  };
}
function rowToCond(r: any): ConditioningLog {
  return {
    id: r.id,
    date: r.date,
    type: r.type,
    durationMin: r.duration_min,
    rpe: r.rpe ?? undefined,
    avgHR: r.avg_hr ?? undefined,
    notes: r.notes ?? undefined,
  };
}

function readinessToRow(l: ReadinessLog, userId: string) {
  return {
    id: l.id,
    user_id: userId,
    date: l.date,
    weight_kg: l.weightKg ?? null,
    sleep_hours: l.sleepHours ?? null,
    sleep_quality: l.sleepQuality,
    fatigue: l.fatigue,
    energy: l.energy,
    soreness: l.soreness,
    low_back_pain: l.lowBackPain,
    motivation: l.motivation,
    notes: l.notes ?? null,
  };
}
function rowToReadiness(r: any): ReadinessLog {
  return {
    id: r.id,
    date: r.date,
    weightKg: r.weight_kg ?? undefined,
    sleepHours: r.sleep_hours ?? undefined,
    sleepQuality: r.sleep_quality,
    fatigue: r.fatigue,
    energy: r.energy,
    soreness: r.soreness,
    lowBackPain: r.low_back_pain,
    motivation: r.motivation,
    notes: r.notes ?? undefined,
  };
}

function bodyToRow(l: BodyMetricLog, userId: string) {
  return {
    id: l.id,
    user_id: userId,
    date: l.date,
    weight_kg: l.weightKg ?? null,
    waist_cm: l.waistCm ?? null,
    notes: l.notes ?? null,
  };
}
function rowToBody(r: any): BodyMetricLog {
  return {
    id: r.id,
    date: r.date,
    weightKg: r.weight_kg ?? undefined,
    waistCm: r.waist_cm ?? undefined,
    notes: r.notes ?? undefined,
  };
}

/* -------- Push (one row at a time) -------- */

export async function pushSessionLog(log: SessionLog): Promise<void> {
  if (!supabase) return;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase.from("session_logs").upsert(sessionLogToRow(log, u.user.id));
}

export async function pushConditioning(log: ConditioningLog): Promise<void> {
  if (!supabase) return;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase.from("conditioning_logs").upsert(condToRow(log, u.user.id));
}

export async function pushReadiness(log: ReadinessLog): Promise<void> {
  if (!supabase) return;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase.from("readiness_logs").upsert(readinessToRow(log, u.user.id));
}

export async function pushBodyMetric(log: BodyMetricLog): Promise<void> {
  if (!supabase) return;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase.from("body_metric_logs").upsert(bodyToRow(log, u.user.id));
}

/* -------- Pull all (replaces local with cloud) -------- */

export interface PulledData {
  sessionLogs: SessionLog[];
  conditioningLogs: ConditioningLog[];
  readinessLogs: ReadinessLog[];
  bodyMetricLogs: BodyMetricLog[];
}

export async function pullAll(): Promise<PulledData | null> {
  if (!supabase) return null;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;

  const [s, c, r, b] = await Promise.all([
    supabase.from("session_logs").select("*").order("date", { ascending: false }),
    supabase.from("conditioning_logs").select("*").order("date", { ascending: false }),
    supabase.from("readiness_logs").select("*").order("date", { ascending: false }),
    supabase.from("body_metric_logs").select("*").order("date", { ascending: false }),
  ]);

  return {
    sessionLogs: (s.data ?? []).map(rowToSessionLog),
    conditioningLogs: (c.data ?? []).map(rowToCond),
    readinessLogs: (r.data ?? []).map(rowToReadiness),
    bodyMetricLogs: (b.data ?? []).map(rowToBody),
  };
}

/* -------- Push everything (initial sync after sign-in) -------- */

export async function pushAll(data: PulledData): Promise<void> {
  if (!supabase) return;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  const uid = u.user.id;

  if (data.sessionLogs.length)
    await supabase.from("session_logs").upsert(data.sessionLogs.map((l) => sessionLogToRow(l, uid)));
  if (data.conditioningLogs.length)
    await supabase.from("conditioning_logs").upsert(data.conditioningLogs.map((l) => condToRow(l, uid)));
  if (data.readinessLogs.length)
    await supabase.from("readiness_logs").upsert(data.readinessLogs.map((l) => readinessToRow(l, uid)));
  if (data.bodyMetricLogs.length)
    await supabase.from("body_metric_logs").upsert(data.bodyMetricLogs.map((l) => bodyToRow(l, uid)));
}

export const CLOUD_AVAILABLE = SUPABASE_CONFIGURED;
