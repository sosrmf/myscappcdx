import { Guidance, ReadinessLog, SessionLog } from "./types";

/**
 * Simple, transparent guidance.
 * Not a medical system — heuristics on top of self-reported data.
 */
export function computeGuidance(
  todayReadiness: ReadinessLog | undefined,
  recentSessions: SessionLog[],
  conditioningMinThisWeek: number
): Guidance {
  const flags: string[] = [];

  if (!todayReadiness) {
    return {
      level: "normal",
      title: "Pas encore de check-in aujourd'hui",
      message:
        "Fais un check-in rapide pour ajuster la séance du jour à ton état réel.",
      flags: ["no_checkin"],
    };
  }

  const r = todayReadiness;
  const highFatigue = r.fatigue >= 4;
  const lowEnergy = r.energy <= 2;
  const highBackPain = r.lowBackPain >= 5;
  const moderateBackPain = r.lowBackPain >= 3 && r.lowBackPain < 5;
  const goodSleep = (r.sleepHours ?? 0) >= 7 && r.sleepQuality >= 4;
  const goodEnergy = r.energy >= 4;

  if (highBackPain) flags.push("low_back_pain_high");
  else if (moderateBackPain) flags.push("low_back_pain_moderate");
  if (highFatigue) flags.push("high_fatigue");
  if (lowEnergy) flags.push("low_energy");

  // Adherence
  const last7 = recentSessions.filter((s) => {
    const d = new Date(s.date);
    return Date.now() - d.getTime() < 7 * 24 * 3600 * 1000;
  });
  const missed = last7.filter((s) => !s.completed).length;
  if (missed >= 2) flags.push("adherence_warning");

  if (conditioningMinThisWeek < 60) flags.push("conditioning_low");

  // Decision tree
  if (highBackPain) {
    return {
      level: "caution",
      title: "Bas du dos sensible",
      message:
        "Évite hinge lourd et compression axiale. Garde mobilité, carries légers, Z2 court. Teste pendant l'échauffement.",
      flags,
    };
  }

  if (highFatigue && lowEnergy) {
    return {
      level: "recovery_focus",
      title: "Journée récupération",
      message:
        "Fatigue haute et énergie basse. Mobilité, marche, Z2 facile. Reporte la séance de force lourde si possible.",
      flags,
    };
  }

  if (highFatigue || lowEnergy) {
    return {
      level: "reduced_load",
      title: "Charge réduite",
      message:
        "Réduis 1-2 RPE sur les gros exos. Coupe les séries de finition. Garde la qualité technique.",
      flags,
    };
  }

  if (goodSleep && goodEnergy && r.motivation >= 4) {
    return {
      level: "push",
      title: "Bonne journée pour pousser",
      message:
        "Sommeil OK, énergie haute. Tu peux viser le haut de fourchette RPE sur la séance principale.",
      flags,
    };
  }

  return {
    level: "normal",
    title: "Journée standard",
    message:
      "Suis la séance prévue à RPE cible. Surveille bas du dos si tu fais du hinge.",
    flags,
  };
}

export function guidanceColor(level: Guidance["level"]): string {
  switch (level) {
    case "push":
      return "#22c55e"; // green
    case "normal":
      return "#3b82f6"; // blue
    case "reduced_load":
      return "#f59e0b"; // amber
    case "recovery_focus":
      return "#8b5cf6"; // purple
    case "caution":
      return "#ef4444"; // red
  }
}

export function guidanceLabel(level: Guidance["level"]): string {
  switch (level) {
    case "push":
      return "PUSH";
    case "normal":
      return "NORMAL";
    case "reduced_load":
      return "CHARGE RÉDUITE";
    case "recovery_focus":
      return "RÉCUPÉRATION";
    case "caution":
      return "PRUDENCE";
  }
}
