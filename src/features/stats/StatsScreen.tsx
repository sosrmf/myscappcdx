import React from "react";
import { Dimensions, View } from "react-native";

import { Card, H1, H2, Muted, Row, Screen, Small } from "../../components/ui";
import { Bars, Sparkline } from "../../components/Sparkline";
import { colors, spacing } from "../../app/theme";
import { useAppStore } from "../../data/store";
import {
  painTrend,
  readinessTrend,
  topExercisesByVolume,
  weeklyConditioningByType,
  weeklyConditioningMinutes,
  weeklySessionsCount,
  weeklyVolume,
  weightTrend,
} from "../../data/analytics";

export const StatsScreen: React.FC = () => {
  const sessionLogs = useAppStore((s) => s.sessionLogs);
  const conditioningLogs = useAppStore((s) => s.conditioningLogs);
  const readinessLogs = useAppStore((s) => s.readinessLogs);
  const w = Dimensions.get("window").width - 64;

  const condByType = weeklyConditioningByType(conditioningLogs);
  const top = topExercisesByVolume(sessionLogs);
  const weight = weightTrend(readinessLogs);
  const pain = painTrend(readinessLogs);
  const readiness = readinessTrend(readinessLogs);

  const condBars = Object.entries(condByType).map(([k, v]) => ({ label: k, value: v }));

  return (
    <Screen>
      <Small>ANALYTICS</Small>
      <H1 style={{ marginTop: 4, marginBottom: spacing.lg }}>Statistiques</H1>

      <Row style={{ gap: spacing.md, marginBottom: spacing.md }}>
        <Card style={{ flex: 1, marginBottom: 0 }}>
          <Small>SÉANCES</Small>
          <H1 style={{ marginTop: 4 }}>{weeklySessionsCount(sessionLogs)}</H1>
          <Muted>cette semaine</Muted>
        </Card>
        <Card style={{ flex: 1, marginBottom: 0 }}>
          <Small>CONDITIONING</Small>
          <H1 style={{ marginTop: 4 }}>{weeklyConditioningMinutes(conditioningLogs)} min</H1>
          <Muted>cette semaine</Muted>
        </Card>
      </Row>

      <Card>
        <Small>VOLUME D'ENTRAÎNEMENT (semaine)</Small>
        <H1 style={{ marginTop: 4 }}>{weeklyVolume(sessionLogs).toFixed(0)} kg</H1>
        <Muted>somme reps × charge sur séances complétées</Muted>
      </Card>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Conditioning par type (semaine)</H2>
        {condBars.length > 0 ? <Bars values={condBars} /> : <Muted>Pas encore de données.</Muted>}
        <Row style={{ flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm }}>
          {condBars.map((b) => (
            <View key={b.label}>
              <Small>{b.label} : {b.value} min</Small>
            </View>
          ))}
        </Row>
      </Card>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Tendance poids</H2>
        {weight.length > 1 ? (
          <Sparkline values={weight.map((t) => t.weight)} width={w} height={90} />
        ) : (
          <Muted>Pas encore assez de données.</Muted>
        )}
      </Card>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Readiness (score 0-10)</H2>
        {readiness.length > 1 ? (
          <Sparkline
            values={readiness.map((t) => t.score)}
            width={w}
            height={90}
            color={colors.info}
            yMin={0}
            yMax={10}
          />
        ) : (
          <Muted>Pas encore assez de données.</Muted>
        )}
      </Card>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Bas du dos (0-10)</H2>
        {pain.length > 1 ? (
          <Sparkline
            values={pain.map((t) => t.pain)}
            width={w}
            height={90}
            color={colors.danger}
            yMin={0}
            yMax={10}
          />
        ) : (
          <Muted>Pas encore assez de données.</Muted>
        )}
      </Card>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Top volume — exercices</H2>
        {top.length === 0 ? (
          <Muted>Loggue des séances pour voir le classement.</Muted>
        ) : (
          top.map((t) => (
            <Row key={t.name} style={{ justifyContent: "space-between", paddingVertical: 6 }}>
              <Muted style={{ flex: 1, color: colors.text }}>{t.name}</Muted>
              <Small>{t.volume.toFixed(0)} kg</Small>
            </Row>
          ))
        )}
      </Card>
    </Screen>
  );
};
