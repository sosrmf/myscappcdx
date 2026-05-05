import React, { useMemo, useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

import {
  Button,
  Card,
  Field,
  H1,
  Input,
  Muted,
  Pill,
  Screen,
  Small,
  Stepper,
} from "../../components/ui";
import { spacing } from "../../app/theme";
import { todayISO, useAppStore } from "../../data/store";
import { computeGuidance, guidanceColor, guidanceLabel } from "../../data/coaching";
import { weeklyConditioningMinutes } from "../../data/analytics";
import { ReadinessLog } from "../../data/types";

export const CheckinScreen: React.FC = () => {
  const nav = useNavigation();
  const upsert = useAppStore((s) => s.upsertReadiness);
  const existing = useAppStore((s) =>
    s.readinessLogs.find((r) => r.date === todayISO())
  );
  const sessionLogs = useAppStore((s) => s.sessionLogs);
  const conditioningLogs = useAppStore((s) => s.conditioningLogs);

  const [weight, setWeight] = useState<string>(existing?.weightKg?.toString() ?? "");
  const [sleepH, setSleepH] = useState<string>(existing?.sleepHours?.toString() ?? "");
  const [sleepQ, setSleepQ] = useState<number>(existing?.sleepQuality ?? 3);
  const [fatigue, setFatigue] = useState<number>(existing?.fatigue ?? 3);
  const [energy, setEnergy] = useState<number>(existing?.energy ?? 3);
  const [soreness, setSoreness] = useState<number>(existing?.soreness ?? 2);
  const [lowBack, setLowBack] = useState<number>(existing?.lowBackPain ?? 0);
  const [motivation, setMotivation] = useState<number>(existing?.motivation ?? 3);
  const [notes, setNotes] = useState<string>(existing?.notes ?? "");

  const previewLog: ReadinessLog = {
    id: existing?.id ?? `rd_${todayISO()}`,
    date: todayISO(),
    weightKg: weight ? parseFloat(weight) || undefined : undefined,
    sleepHours: sleepH ? parseFloat(sleepH) || undefined : undefined,
    sleepQuality: sleepQ,
    fatigue,
    energy,
    soreness,
    lowBackPain: lowBack,
    motivation,
    notes: notes || undefined,
  };

  const condMin = useMemo(
    () => weeklyConditioningMinutes(conditioningLogs),
    [conditioningLogs]
  );
  const preview = computeGuidance(previewLog, sessionLogs, condMin);

  function save() {
    upsert(previewLog);
    Alert.alert("Check-in enregistré", "Guidance mise à jour.");
    nav.goBack();
  }

  return (
    <Screen>
      <Small>CHECK-IN</Small>
      <H1 style={{ marginTop: 4, marginBottom: spacing.lg }}>État du jour</H1>

      <Card glow={guidanceColor(preview.level)}>
        <Pill label={guidanceLabel(preview.level)} color={guidanceColor(preview.level)} />
        <Muted style={{ marginTop: spacing.sm }}>{preview.message}</Muted>
      </Card>

      <Card>
        <Field label="Poids (kg)">
          <Input value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="78.5" />
        </Field>
        <Field label="Sommeil (heures)">
          <Input value={sleepH} onChangeText={setSleepH} keyboardType="decimal-pad" placeholder="7.5" />
        </Field>
        <Field label="Qualité du sommeil (1-5)">
          <Stepper value={sleepQ} min={1} max={5} onChange={setSleepQ} />
        </Field>
      </Card>

      <Card>
        <Field label="Fatigue (1-5)" hint="5 = épuisé">
          <Stepper value={fatigue} min={1} max={5} onChange={setFatigue} />
        </Field>
        <Field label="Énergie (1-5)">
          <Stepper value={energy} min={1} max={5} onChange={setEnergy} />
        </Field>
        <Field label="Soreness / courbatures (1-5)">
          <Stepper value={soreness} min={1} max={5} onChange={setSoreness} />
        </Field>
        <Field label="Motivation (1-5)">
          <Stepper value={motivation} min={1} max={5} onChange={setMotivation} />
        </Field>
      </Card>

      <Card glow={lowBack >= 5 ? "#ef4444" : lowBack >= 3 ? "#f59e0b" : undefined}>
        <Field label="Bas du dos (0-10)" hint="0 = aucune douleur · 5+ = prudence sur les hinges">
          <Stepper value={lowBack} min={0} max={10} onChange={setLowBack} />
        </Field>
      </Card>

      <Card>
        <Field label="Notes">
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Stress, hydratation, contexte…"
            multiline
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />
        </Field>
      </Card>

      <Button label="Enregistrer" onPress={save} />
    </Screen>
  );
};
