import React, { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

import {
  Body,
  Button,
  Card,
  Field,
  H1,
  H2,
  Input,
  Muted,
  Screen,
  Segmented,
  Small,
  Stepper,
} from "../../components/ui";
import { spacing } from "../../app/theme";
import { todayISO, useAppStore } from "../../data/store";
import { Bars } from "../../components/Sparkline";
import { weeklyConditioningByType, weeklyConditioningMinutes } from "../../data/analytics";
import { ConditioningLog, ConditioningType } from "../../data/types";

const TYPES: { value: ConditioningType; label: string }[] = [
  { value: "zone2", label: "Z2" },
  { value: "threshold", label: "Threshold" },
  { value: "intervals", label: "Intervalles" },
  { value: "cardiac_power", label: "Cardiac Power" },
  { value: "tempo", label: "Tempo" },
  { value: "high_resistance", label: "HRI" },
  { value: "jjb_roll", label: "JJB" },
];

export const ConditioningScreen: React.FC = () => {
  const nav = useNavigation();
  const upsert = useAppStore((s) => s.upsertConditioning);
  const logs = useAppStore((s) => s.conditioningLogs);

  const [type, setType] = useState<ConditioningType>("zone2");
  const [duration, setDuration] = useState<number>(30);
  const [rpe, setRpe] = useState<number>(6);
  const [hr, setHr] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  function save() {
    const log: ConditioningLog = {
      id: `c_${Date.now()}`,
      date: todayISO(),
      type,
      durationMin: duration,
      rpe,
      avgHR: hr ? parseInt(hr, 10) || undefined : undefined,
      notes: notes || undefined,
    };
    upsert(log);
    Alert.alert("Conditioning enregistré");
    nav.goBack();
  }

  const weekTotal = weeklyConditioningMinutes(logs);
  const byType = weeklyConditioningByType(logs);
  const barData = TYPES.map((t) => ({
    label: t.label,
    value: byType[t.value] ?? 0,
  }));

  return (
    <Screen>
      <Small>CONDITIONING</Small>
      <H1 style={{ marginTop: 4, marginBottom: spacing.lg }}>Cardio / Conditioning</H1>

      <Card>
        <Small>CETTE SEMAINE</Small>
        <H1 style={{ marginTop: 4 }}>{weekTotal} min</H1>
        <Muted>Cible JJB : ≥ 180 min/sem (Z2 dominant)</Muted>
        <Bars values={barData} />
      </Card>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Nouvelle séance</H2>
        <Field label="Type">
          <Segmented
            options={TYPES.slice(0, 4).map((t) => ({ value: t.value, label: t.label }))}
            value={type}
            onChange={(v) => setType(v as ConditioningType)}
          />
        </Field>
        <Field label="Type alternatif">
          <Segmented
            options={TYPES.slice(4).map((t) => ({ value: t.value, label: t.label }))}
            value={type}
            onChange={(v) => setType(v as ConditioningType)}
          />
        </Field>
        <Field label="Durée (min)">
          <Stepper value={duration} min={5} max={180} step={5} onChange={setDuration} />
        </Field>
        <Field label="RPE">
          <Stepper value={rpe} min={1} max={10} onChange={setRpe} />
        </Field>
        <Field label="FC moyenne (optionnel)">
          <Input value={hr} onChangeText={setHr} keyboardType="number-pad" placeholder="142" />
        </Field>
        <Field label="Notes">
          <Input value={notes} onChangeText={setNotes} placeholder="Allure, ressenti…" multiline style={{ minHeight: 60, textAlignVertical: "top" }} />
        </Field>
        <Button label="Enregistrer" onPress={save} />
      </Card>

      <H2 style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>Historique</H2>
      {logs
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((l) => (
          <Card key={l.id}>
            <Body style={{ fontWeight: "700" }}>{l.type}</Body>
            <Muted>
              {l.date} · {l.durationMin} min{l.rpe ? ` · RPE ${l.rpe}` : ""}
            </Muted>
            {l.notes ? <Muted>{l.notes}</Muted> : null}
          </Card>
        ))}
    </Screen>
  );
};
