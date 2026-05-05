import { Day, JJBSlot, ScheduleSettings, Session, SessionType, Weekday } from "./types";

// Weekday labels (0 = Mon)
export const WEEKDAYS = [
  "Lun",
  "Mar",
  "Mer",
  "Jeu",
  "Ven",
  "Sam",
  "Dim",
] as const;

export const WEEKDAYS_FULL = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;

export interface PlannedSlot {
  weekday: Weekday;
  type: SessionType;
  label: string;
  reason: string;
}

// Distance helper on a 7-day cyclic week
function distance(a: Weekday, b: Weekday): number {
  const d = Math.abs(a - b);
  return Math.min(d, 7 - d);
}

// Pick the weekday with the largest minimum distance from a set of "busy" days.
function pickFurthest(candidates: Weekday[], busy: Weekday[]): Weekday {
  let best: Weekday = candidates[0];
  let bestScore = -1;
  for (const c of candidates) {
    const score = busy.length === 0 ? 7 : Math.min(...busy.map((b) => distance(c, b)));
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

/**
 * Build a weekly plan from settings.
 * Priorities, in order:
 *  1) JJB days are fixed (input).
 *  2) Heaviest S&C session must NOT land the day before a JJB day if avoidable
 *     (especially if it's an evening JJB).
 *  3) Conditioning sessions are spaced from JJB.
 *  4) Recovery / mobility fills the gap nearest to a JJB day.
 *  5) Low-back caution -> swap heavy hinge day for hip-thrust focused day.
 */
export function buildWeeklyPlan(settings: ScheduleSettings): PlannedSlot[] {
  const all: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
  const jjbDays = settings.jjbSlots.map((s) => s.weekday);
  const slots: PlannedSlot[] = [];

  // 1) JJB
  for (const j of settings.jjbSlots) {
    slots.push({
      weekday: j.weekday,
      type: "jjb",
      label: `JJB (${dayPartLabel(j.dayPart)})`,
      reason: "Priorité performance JJB",
    });
  }

  const used = new Set<Weekday>(jjbDays);
  const free = (): Weekday[] => all.filter((d) => !used.has(d));

  // 2) Main S&C — placed furthest from any JJB day
  if (settings.scStrengthCount >= 1) {
    const d = pickFurthest(free(), [...used]);
    slots.push({
      weekday: d,
      type: "strength",
      label: "Force — Dos / Épaules (principale)",
      reason: "Loin du JJB pour fraîcheur maximale",
    });
    used.add(d);
  }

  // 3) Conditioning Z2 — also furthest from JJB, but distinct from main S&C
  if (settings.conditioningCount >= 1) {
    const d = pickFurthest(free(), [...used]);
    slots.push({
      weekday: d,
      type: "conditioning",
      label: "Conditioning — Zone 2 (base aérobie)",
      reason: "Cardiac output, base aérobie pour le JJB",
    });
    used.add(d);
  }

  // 4) Secondary S&C
  if (settings.scStrengthCount >= 2) {
    const d = pickFurthest(free(), [...used]);
    slots.push({
      weekday: d,
      type: "strength",
      label: "Force — Posterior chain & core (secondaire)",
      reason: settings.lowBackCaution
        ? "Hinge prudent (hip thrust) — bas du dos surveillé"
        : "Posterior chain + core",
    });
    used.add(d);
  }

  // 5) Threshold / intervals
  if (settings.conditioningCount >= 2) {
    const d = pickFurthest(free(), [...used]);
    // Avoid scheduling intervals immediately before an evening JJB
    const adjusted = adjustForJJBProximity(d, settings.jjbSlots, free());
    slots.push({
      weekday: adjusted,
      type: "conditioning",
      label: "Threshold / Intervalles",
      reason: "Capacité anaérobie lactique — éviter veille de JJB soir",
    });
    used.add(adjusted);
  }

  // 6) Recovery / mobility — closest to JJB day to support recovery
  if (settings.recoveryCount >= 1 && free().length > 0) {
    const candidates = free();
    let best: Weekday = candidates[0];
    let bestScore = Infinity;
    for (const c of candidates) {
      const s = Math.min(...jjbDays.map((j) => distance(c, j)));
      if (s < bestScore) {
        bestScore = s;
        best = c;
      }
    }
    slots.push({
      weekday: best,
      type: "mobility",
      label: "Mobilité / Récupération active",
      reason: "Soutien à la récupération autour du JJB",
    });
    used.add(best);
  }

  // Remaining free days = rest
  for (const d of free()) {
    slots.push({
      weekday: d,
      type: "rest",
      label: "Repos",
      reason: "Récupération passive",
    });
  }

  return slots.sort((a, b) => a.weekday - b.weekday);
}

function dayPartLabel(p: "morning" | "midday" | "evening"): string {
  return p === "morning" ? "matin" : p === "midday" ? "midi" : "soir";
}

function adjustForJJBProximity(
  candidate: Weekday,
  jjbSlots: JJBSlot[],
  available: Weekday[]
): Weekday {
  const eveningJJB = jjbSlots.filter((s) => s.dayPart === "evening").map((s) => s.weekday);
  const dayBefore = (d: Weekday): Weekday => ((d + 6) % 7) as Weekday;
  const forbidden = new Set(eveningJJB.map(dayBefore));
  if (!forbidden.has(candidate)) return candidate;
  const alt = available.find((d) => !forbidden.has(d));
  return alt ?? candidate;
}

// Apply a planned slot onto a Day record, replacing only the metadata.
// The actual session content comes from the program template.
export function applyPlanToDays(
  days: Day[],
  plan: PlannedSlot[],
  sessionsByType: Record<SessionType, Session | undefined>
): Day[] {
  return days.map((day) => {
    const slot = plan.find((p) => p.weekday === day.weekday);
    if (!slot) return day;
    if (slot.type === "rest") return { ...day, session: undefined, isJJB: false };
    if (slot.type === "jjb") {
      return {
        ...day,
        isJJB: true,
        session: sessionsByType.jjb,
      };
    }
    return {
      ...day,
      isJJB: false,
      session: sessionsByType[slot.type],
    };
  });
}
