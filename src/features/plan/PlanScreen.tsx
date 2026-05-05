import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Body,
  Card,
  H1,
  H2,
  Muted,
  Pill,
  Row,
  Screen,
  Small,
} from "../../components/ui";
import { colors, sessionTypeColor, spacing } from "../../app/theme";
import { useAppStore } from "../../data/store";
import { WEEKDAYS_FULL } from "../../data/scheduler";
import { RootStackParamList } from "../../app/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const PlanScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const program = useAppStore((s) => s.program);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [weekIdx, setWeekIdx] = useState(0);

  const phase = program.phases[phaseIdx];
  const week = phase?.weeks[weekIdx];

  return (
    <Screen>
      <Small>PROGRAMME</Small>
      <H1 style={{ marginTop: 4, marginBottom: spacing.sm }}>{program.name}</H1>
      <Muted style={{ marginBottom: spacing.lg }}>{program.goal}</Muted>

      <Row style={{ gap: spacing.sm, marginBottom: spacing.md, flexWrap: "wrap" }}>
        {program.phases.map((p, i) => {
          const active = i === phaseIdx;
          return (
            <Pressable
              key={p.id}
              onPress={() => {
                setPhaseIdx(i);
                setWeekIdx(0);
              }}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 999,
                backgroundColor: active ? colors.accent : colors.bgElev2,
              }}
            >
              <Body style={{ color: active ? "#fff" : colors.textMuted, fontWeight: "700" }}>
                Phase {p.index}
              </Body>
            </Pressable>
          );
        })}
      </Row>

      <Card>
        <H2>{phase?.name}</H2>
        <Muted style={{ marginTop: 4 }}>{phase?.goal}</Muted>
      </Card>

      <Row style={{ gap: spacing.sm, marginBottom: spacing.md, flexWrap: "wrap" }}>
        {phase?.weeks.map((w, i) => {
          const active = i === weekIdx;
          return (
            <Pressable
              key={w.id}
              onPress={() => setWeekIdx(i)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 999,
                backgroundColor: active ? colors.bgElev2 : "transparent",
                borderWidth: 1,
                borderColor: active ? colors.accent : colors.border,
              }}
            >
              <Small style={{ color: active ? colors.text : colors.textMuted, fontWeight: "700" }}>
                S{w.index}
              </Small>
            </Pressable>
          );
        })}
      </Row>

      <Muted style={{ marginBottom: spacing.md }}>{week?.focus}</Muted>

      {week?.days.map((d, i) => {
        const c = d.session ? sessionTypeColor(d.session.type) : colors.textDim;
        return (
          <Pressable
            key={d.id}
            onPress={() =>
              d.session &&
              nav.navigate("SessionDetail", {
                sessionId: d.session.id,
                phaseIdx,
                weekIdx,
                weekday: d.weekday,
              })
            }
          >
            <Card style={{ borderLeftWidth: 4, borderLeftColor: c }}>
              <Row style={{ justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                  <Small>{WEEKDAYS_FULL[d.weekday].toUpperCase()}</Small>
                  <H2 style={{ marginTop: 2 }}>
                    {d.session ? d.session.title : "Repos"}
                  </H2>
                  {d.session ? (
                    <Muted style={{ marginTop: 4 }}>{d.session.focus}</Muted>
                  ) : (
                    <Muted style={{ marginTop: 4 }}>Récupération passive</Muted>
                  )}
                </View>
                {d.isJJB ? (
                  <Pill label="JJB" color={colors.jjb} />
                ) : d.session ? (
                  <Pill label={d.session.type} color={c} />
                ) : null}
              </Row>
            </Card>
          </Pressable>
        );
      })}
    </Screen>
  );
};
