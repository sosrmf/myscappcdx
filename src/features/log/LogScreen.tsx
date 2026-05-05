import React from "react";
import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Body, Card, EmptyState, H1, H2, Muted, Pill, Row, Screen, Small } from "../../components/ui";
import { colors, sessionTypeColor, spacing } from "../../app/theme";
import { useAppStore } from "../../data/store";
import { exerciseVolume } from "../../data/analytics";
import { RootStackParamList } from "../../app/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const LogScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const sessionLogs = useAppStore((s) => s.sessionLogs);
  const conditioningLogs = useAppStore((s) => s.conditioningLogs);

  const sorted = [...sessionLogs].sort((a, b) => b.date.localeCompare(a.date));
  const condSorted = [...conditioningLogs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Screen>
      <Small>HISTORIQUE</Small>
      <H1 style={{ marginTop: 4, marginBottom: spacing.lg }}>Journal</H1>

      <H2 style={{ marginBottom: spacing.sm }}>Séances</H2>
      {sorted.length === 0 ? (
        <EmptyState title="Aucune séance loguée" hint="Lance ta séance du jour depuis l'accueil." />
      ) : (
        sorted.map((log) => (
          <Card key={log.id} style={{ borderLeftWidth: 4, borderLeftColor: sessionTypeColor(log.type) }}>
            <Row style={{ justifyContent: "space-between" }}>
              <Body style={{ fontWeight: "700", flex: 1 }}>{log.sessionTitle}</Body>
              <Pill label={log.completed ? "fait" : "brouillon"} color={log.completed ? colors.success : colors.warning} />
            </Row>
            <Muted style={{ marginTop: 4 }}>{log.date}</Muted>
            <Row style={{ marginTop: spacing.sm, gap: spacing.md }}>
              <Small>Volume {exerciseVolume(log).toFixed(0)} kg</Small>
              {log.durationMin ? <Small>· {log.durationMin} min</Small> : null}
              {log.rpe ? <Small>· RPE {log.rpe}</Small> : null}
            </Row>
            {log.notes ? <Muted style={{ marginTop: 4 }}>{log.notes}</Muted> : null}
          </Card>
        ))
      )}

      <H2 style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>Conditioning</H2>
      <Pressable onPress={() => nav.navigate("Conditioning")}>
        <Card>
          <Body style={{ fontWeight: "700" }}>+ Ajouter une séance conditioning</Body>
          <Muted>Z2, threshold, intervalles, JJB, etc.</Muted>
        </Card>
      </Pressable>
      {condSorted.map((c) => (
        <Card key={c.id}>
          <Row style={{ justifyContent: "space-between" }}>
            <Body style={{ fontWeight: "700" }}>{c.type}</Body>
            <Small>{c.date}</Small>
          </Row>
          <Muted style={{ marginTop: 4 }}>
            {c.durationMin} min{c.rpe ? ` · RPE ${c.rpe}` : ""}
            {c.avgHR ? ` · FC moy ${c.avgHR}` : ""}
          </Muted>
          {c.notes ? <Muted style={{ marginTop: 2 }}>{c.notes}</Muted> : null}
        </Card>
      ))}
    </Screen>
  );
};
