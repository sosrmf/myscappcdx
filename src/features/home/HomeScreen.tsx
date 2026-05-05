import React, { useMemo } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Body,
  Button,
  Card,
  H1,
  H2,
  Muted,
  Pill,
  Row,
  Screen,
  Small,
} from "../../components/ui";
import { colors, spacing } from "../../app/theme";
import {
  getCurrentWeek,
  getCurrentWeekDays,
  getTodayDay,
  todayISO,
  useAppStore,
} from "../../data/store";
import { computeGuidance, guidanceColor, guidanceLabel } from "../../data/coaching";
import {
  weeklyCompletionRate,
  weeklyConditioningMinutes,
  weeklySessionsCount,
} from "../../data/analytics";
import { sessionTypeColor } from "../../app/theme";
import { WEEKDAYS } from "../../data/scheduler";
import { RootStackParamList } from "../../app/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const program = useAppStore((s) => s.program);
  const readinessLogs = useAppStore((s) => s.readinessLogs);
  const sessionLogs = useAppStore((s) => s.sessionLogs);
  const conditioningLogs = useAppStore((s) => s.conditioningLogs);

  const today = todayISO();
  const todayDay = getTodayDay(program);
  const week = getCurrentWeek(program);
  const phase = program.phases[week.phaseIndex];
  const currentWeek = phase?.weeks[week.weekIndex];

  const todayReadiness = readinessLogs.find((r) => r.date === today);
  const condMin = weeklyConditioningMinutes(conditioningLogs);
  const guidance = useMemo(
    () => computeGuidance(todayReadiness, sessionLogs, condMin),
    [todayReadiness, sessionLogs, condMin]
  );

  const days = getCurrentWeekDays(program);
  const planned = days.filter((d) => d.session).length;
  const completion = weeklyCompletionRate(sessionLogs, planned);
  const sessionsDone = weeklySessionsCount(sessionLogs);

  const lowBackPain = todayReadiness?.lowBackPain ?? 0;
  const weight = readinessLogs
    .slice()
    .reverse()
    .find((r) => typeof r.weightKg === "number")?.weightKg;

  return (
    <Screen>
      <Small>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</Small>
      <H1 style={{ marginTop: 4, marginBottom: spacing.lg }}>Tableau de bord</H1>

      {/* Guidance */}
      <Card glow={guidanceColor(guidance.level)}>
        <Row style={{ justifyContent: "space-between" }}>
          <Pill label={guidanceLabel(guidance.level)} color={guidanceColor(guidance.level)} />
          {lowBackPain >= 3 ? <Pill label={`bas du dos ${lowBackPain}/10`} color={colors.danger} /> : null}
        </Row>
        <H2 style={{ marginTop: spacing.sm }}>{guidance.title}</H2>
        <Muted style={{ marginTop: 4 }}>{guidance.message}</Muted>
        {!todayReadiness ? (
          <Button
            label="Faire le check-in du jour"
            onPress={() => nav.navigate("Checkin")}
            style={{ marginTop: spacing.md }}
          />
        ) : null}
      </Card>

      {/* Today session */}
      <Card>
        <Small>SÉANCE DU JOUR</Small>
        {todayDay?.session ? (
          <>
            <Row style={{ justifyContent: "space-between", marginTop: 4 }}>
              <H2>{todayDay.session.title}</H2>
              <Pill
                label={todayDay.isJJB ? "JJB" : todayDay.session.type}
                color={sessionTypeColor(todayDay.session.type)}
              />
            </Row>
            <Muted style={{ marginTop: 4 }}>{todayDay.session.focus}</Muted>
            <Muted>{todayDay.session.durationMin} min · {todayDay.session.blocks.length} blocs</Muted>
            <Row style={{ marginTop: spacing.md, gap: spacing.sm }}>
              <Button
                label="Voir la séance"
                onPress={() =>
                  nav.navigate("SessionDetail", {
                    sessionId: todayDay.session!.id,
                    phaseIdx: week.phaseIndex,
                    weekIdx: week.weekIndex,
                    weekday: todayDay.weekday,
                  })
                }
                style={{ flex: 1 }}
              />
              <Button
                label="Démarrer"
                variant="secondary"
                onPress={() =>
                  nav.navigate("LogSession", {
                    sessionId: todayDay.session!.id,
                    phaseIdx: week.phaseIndex,
                    weekIdx: week.weekIndex,
                    weekday: todayDay.weekday,
                  })
                }
                style={{ flex: 1 }}
              />
            </Row>
          </>
        ) : (
          <View>
            <H2 style={{ marginTop: 4 }}>Repos</H2>
            <Muted style={{ marginTop: 4 }}>
              Récupération passive. Tu peux faire un check-in et un suivi poids.
            </Muted>
          </View>
        )}
      </Card>

      {/* Week overview */}
      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <View>
            <Small>PHASE {phase?.index} · SEMAINE {currentWeek?.index}/12</Small>
            <H2 style={{ marginTop: 2 }}>{phase?.name}</H2>
          </View>
        </Row>
        <Muted style={{ marginTop: 4 }}>{currentWeek?.focus}</Muted>

        <Row style={{ justifyContent: "space-between", marginTop: spacing.md }}>
          {days.map((d, i) => {
            const isToday = i === ((new Date().getDay() + 6) % 7);
            const c = d.session ? sessionTypeColor(d.session.type) : colors.textDim;
            return (
              <View key={d.id} style={{ alignItems: "center", flex: 1 }}>
                <Small style={{ color: isToday ? colors.text : colors.textDim }}>
                  {WEEKDAYS[i]}
                </Small>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: c,
                    marginTop: 6,
                    opacity: d.session ? 1 : 0.3,
                  }}
                />
                {d.isJJB ? (
                  <Small style={{ color: colors.jjb, marginTop: 4, fontWeight: "700" }}>JJB</Small>
                ) : null}
              </View>
            );
          })}
        </Row>
      </Card>

      {/* KPIs */}
      <Row style={{ gap: spacing.md, marginBottom: spacing.md }}>
        <Card style={{ flex: 1, marginBottom: 0 }}>
          <Small>SÉANCES</Small>
          <H1 style={{ marginTop: 4 }}>{sessionsDone}/{planned}</H1>
          <Muted>cette semaine</Muted>
        </Card>
        <Card style={{ flex: 1, marginBottom: 0 }}>
          <Small>CONDITIONING</Small>
          <H1 style={{ marginTop: 4 }}>{condMin} min</H1>
          <Muted>cette semaine</Muted>
        </Card>
      </Row>

      <Row style={{ gap: spacing.md }}>
        <Card style={{ flex: 1, marginBottom: 0 }}>
          <Small>POIDS</Small>
          <H1 style={{ marginTop: 4 }}>{weight ? `${weight.toFixed(1)} kg` : "—"}</H1>
          <Muted>dernier check-in</Muted>
        </Card>
        <Card style={{ flex: 1, marginBottom: 0 }}>
          <Small>COMPLÉTION</Small>
          <H1 style={{ marginTop: 4 }}>{Math.round(completion * 100)}%</H1>
          <Muted>hebdo</Muted>
        </Card>
      </Row>

      <View style={{ height: spacing.lg }} />

      <H2 style={{ marginBottom: spacing.sm }}>Actions rapides</H2>
      <Row style={{ flexWrap: "wrap", gap: spacing.sm }}>
        <Button label="Check-in" variant="secondary" onPress={() => nav.navigate("Checkin")} style={{ flexGrow: 1 }} />
        <Button label="Conditioning" variant="secondary" onPress={() => nav.navigate("Conditioning")} style={{ flexGrow: 1 }} />
        <Button label="Mensurations" variant="secondary" onPress={() => nav.navigate("BodyMetrics")} style={{ flexGrow: 1 }} />
      </Row>
    </Screen>
  );
};
