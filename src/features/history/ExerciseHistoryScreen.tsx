import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";

import { Body, Card, H1, H2, Muted, Row, Screen, Small } from "../../components/ui";
import { Sparkline } from "../../components/Sparkline";
import { colors, font, spacing } from "../../app/theme";
import { useAppStore } from "../../data/store";
import { RootStackParamList } from "../../app/navigation";
import { SetLog } from "../../data/types";

type Rt = RouteProp<RootStackParamList, "ExerciseHistory">;

interface SessionEntry {
  date: string;
  maxLoad: number;
  totalVolume: number;
  sets: SetLog[];
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

export const ExerciseHistoryScreen: React.FC = () => {
  const route = useRoute<Rt>();
  const { exerciseName } = route.params;
  const sessionLogs = useAppStore((s) => s.sessionLogs);

  const entries = useMemo<SessionEntry[]>(() => {
    const result: SessionEntry[] = [];
    for (const log of sessionLogs) {
      const exLog = log.exercises.find((e) => e.name === exerciseName);
      if (!exLog) continue;
      const doneSets = exLog.sets.filter((s) => s.done && s.load != null);
      if (!doneSets.length) continue;
      const maxLoad = Math.max(...doneSets.map((s) => s.load!));
      const totalVolume = doneSets.reduce(
        (acc, s) => acc + (s.reps ?? 0) * (s.load ?? 0),
        0
      );
      result.push({ date: log.date, maxLoad, totalVolume, sets: exLog.sets });
    }
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [sessionLogs, exerciseName]);

  const pr =
    entries.length > 0 ? Math.max(...entries.map((e) => e.maxLoad)) : 0;
  const bestVolume =
    entries.length > 0 ? Math.max(...entries.map((e) => e.totalVolume)) : 0;
  const loadValues = entries.map((e) => e.maxLoad);

  const recent = [...entries].reverse().slice(0, 8);

  return (
    <Screen>
      <H1 style={{ marginBottom: 2 }}>{exerciseName}</H1>
      <Muted style={{ marginBottom: spacing.lg }}>
        {entries.length} session{entries.length !== 1 ? "s" : ""} enregistrée
        {entries.length !== 1 ? "s" : ""}
      </Muted>

      {/* PR cards */}
      <Row style={{ gap: spacing.sm, marginBottom: spacing.md }}>
        <Card
          style={{ flex: 1, marginBottom: 0, alignItems: "center" }}
          glow={colors.accent}
        >
          <Small style={{ marginBottom: 4 }}>Record</Small>
          <Text
            style={{
              color: colors.accent,
              fontSize: font.display,
              fontWeight: "800",
              letterSpacing: -1,
            }}
          >
            {pr > 0 ? pr : "—"}
          </Text>
          <Small style={{ marginTop: 2 }}>kg</Small>
        </Card>
        <Card style={{ flex: 1, marginBottom: 0, alignItems: "center" }}>
          <Small style={{ marginBottom: 4 }}>Meilleur vol.</Small>
          <Text
            style={{
              color: colors.text,
              fontSize: font.display,
              fontWeight: "800",
              letterSpacing: -1,
            }}
          >
            {bestVolume > 0 ? Math.round(bestVolume) : "—"}
          </Text>
          <Small style={{ marginTop: 2 }}>kg total</Small>
        </Card>
      </Row>

      {/* Load progression chart */}
      {loadValues.length >= 2 ? (
        <Card>
          <Small style={{ marginBottom: spacing.sm }}>Progression charge max</Small>
          <Sparkline
            values={loadValues}
            width={280}
            height={90}
            color={colors.accent}
            fill
          />
          <Row
            style={{ justifyContent: "space-between", marginTop: spacing.xs }}
          >
            <Muted>{entries.length > 0 ? formatDate(entries[0].date) : ""}</Muted>
            <Muted>
              {entries.length > 0
                ? formatDate(entries[entries.length - 1].date)
                : ""}
            </Muted>
          </Row>
        </Card>
      ) : null}

      {/* Recent sessions */}
      {recent.length > 0 ? (
        <>
          <H2 style={{ marginBottom: spacing.sm, marginTop: spacing.xs }}>
            Dernières séances
          </H2>
          {recent.map((entry, i) => {
            const doneSets = entry.sets.filter((s) => s.done);
            return (
              <Card key={i}>
                <Row style={{ justifyContent: "space-between", marginBottom: spacing.sm }}>
                  <Body style={{ fontWeight: "700" }}>
                    {formatDate(entry.date)}
                  </Body>
                  <Row style={{ gap: spacing.md }}>
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={{
                          color: colors.accent,
                          fontSize: font.h2,
                          fontWeight: "800",
                        }}
                      >
                        {entry.maxLoad}
                      </Text>
                      <Small>kg max</Small>
                    </View>
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: font.h2,
                          fontWeight: "800",
                        }}
                      >
                        {Math.round(entry.totalVolume)}
                      </Text>
                      <Small>vol.</Small>
                    </View>
                  </Row>
                </Row>

                {/* Sets breakdown */}
                {doneSets.map((s, si) => (
                  <Row
                    key={si}
                    style={{
                      paddingVertical: 5,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      gap: spacing.md,
                    }}
                  >
                    <Small style={{ width: 28 }}>S{si + 1}</Small>
                    <Body style={{ flex: 1 }}>
                      {s.reps != null ? `${s.reps} reps` : "—"}
                    </Body>
                    <Body style={{ fontWeight: "700" }}>
                      {s.load != null ? `${s.load} kg` : "—"}
                    </Body>
                    {s.rpe != null ? (
                      <Muted>RPE {s.rpe}</Muted>
                    ) : null}
                  </Row>
                ))}
              </Card>
            );
          })}
        </>
      ) : (
        <Card>
          <Muted style={{ textAlign: "center" }}>
            Aucune série enregistrée encore.{"\n"}Complete ta première séance pour voir la progression ici.
          </Muted>
        </Card>
      )}
    </Screen>
  );
};
