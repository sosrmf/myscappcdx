import React, { useState } from "react";
import { Alert, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

import {
  Button,
  Card,
  Field,
  H1,
  H2,
  Input,
  Muted,
  Screen,
  Small,
} from "../../components/ui";
import { spacing } from "../../app/theme";
import { todayISO, useAppStore } from "../../data/store";
import { Sparkline } from "../../components/Sparkline";
import { weightTrend } from "../../data/analytics";

export const BodyMetricsScreen: React.FC = () => {
  const nav = useNavigation();
  const upsert = useAppStore((s) => s.upsertBodyMetric);
  const upsertReadiness = useAppStore((s) => s.upsertReadiness);
  const readinessLogs = useAppStore((s) => s.readinessLogs);
  const bodyLogs = useAppStore((s) => s.bodyMetricLogs);

  const [weight, setWeight] = useState<string>("");
  const [waist, setWaist] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const trend = weightTrend(readinessLogs);
  const w = Dimensions.get("window").width - 64;

  function save() {
    const log = {
      id: `bm_${Date.now()}`,
      date: todayISO(),
      weightKg: weight ? parseFloat(weight) || undefined : undefined,
      waistCm: waist ? parseFloat(waist) || undefined : undefined,
      notes: notes || undefined,
    };
    upsert(log);
    if (log.weightKg) {
      const today = todayISO();
      const existing = readinessLogs.find((r) => r.date === today);
      if (existing) {
        upsertReadiness({ ...existing, weightKg: log.weightKg });
      }
    }
    Alert.alert("Mensuration enregistrée");
    nav.goBack();
  }

  return (
    <Screen>
      <Small>SUIVI PHYSIQUE</Small>
      <H1 style={{ marginTop: 4, marginBottom: spacing.lg }}>Mensurations</H1>

      <Card>
        <Small>POIDS — TENDANCE</Small>
        {trend.length > 1 ? (
          <Sparkline values={trend.map((t) => t.weight)} width={w} height={100} />
        ) : (
          <Muted style={{ marginTop: spacing.sm }}>Pas encore assez de données.</Muted>
        )}
        {trend.length > 0 ? (
          <Muted style={{ marginTop: spacing.sm }}>
            Dernier : {trend[trend.length - 1].weight.toFixed(1)} kg · Min{" "}
            {Math.min(...trend.map((t) => t.weight)).toFixed(1)} · Max{" "}
            {Math.max(...trend.map((t) => t.weight)).toFixed(1)}
          </Muted>
        ) : null}
      </Card>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Nouvelle mesure</H2>
        <Field label="Poids (kg)">
          <Input value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="78.5" />
        </Field>
        <Field label="Tour de taille (cm)">
          <Input value={waist} onChangeText={setWaist} keyboardType="decimal-pad" placeholder="82" />
        </Field>
        <Field label="Notes">
          <Input value={notes} onChangeText={setNotes} placeholder="À jeun, après entrainement…" />
        </Field>
        <Button label="Enregistrer" onPress={save} />
      </Card>

      <H2 style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>Historique</H2>
      {bodyLogs
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((l) => (
          <Card key={l.id}>
            <Muted>{l.date}</Muted>
            {l.weightKg ? <Muted>Poids : {l.weightKg.toFixed(1)} kg</Muted> : null}
            {l.waistCm ? <Muted>Taille : {l.waistCm} cm</Muted> : null}
            {l.notes ? <Muted>{l.notes}</Muted> : null}
          </Card>
        ))}
    </Screen>
  );
};
