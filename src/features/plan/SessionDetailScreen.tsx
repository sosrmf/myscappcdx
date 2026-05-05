import React from "react";
import { View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
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
import { colors, sessionTypeColor, spacing } from "../../app/theme";
import { useAppStore } from "../../data/store";
import { RootStackParamList } from "../../app/navigation";
import { Session } from "../../data/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, "SessionDetail">;

function findSession(
  program: ReturnType<typeof useAppStore.getState>["program"],
  phaseIdx: number,
  weekIdx: number,
  weekday: number
): Session | undefined {
  return program.phases[phaseIdx]?.weeks[weekIdx]?.days.find((d) => d.weekday === weekday)?.session;
}

export const SessionDetailScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { phaseIdx, weekIdx, weekday } = route.params;
  const program = useAppStore((s) => s.program);
  const session = findSession(program, phaseIdx, weekIdx, weekday);

  if (!session) {
    return (
      <Screen>
        <H1>Séance introuvable</H1>
      </Screen>
    );
  }

  return (
    <Screen>
      <Pill label={session.type} color={sessionTypeColor(session.type)} />
      <H1 style={{ marginTop: spacing.sm }}>{session.title}</H1>
      <Muted style={{ marginBottom: spacing.md }}>{session.focus}</Muted>
      <Muted style={{ marginBottom: spacing.lg }}>
        {session.durationMin} min · {session.blocks.length} blocs
      </Muted>

      {session.conditioning ? (
        <Card>
          <Small>CONDITIONING</Small>
          <H2 style={{ marginTop: 4 }}>{session.conditioning.type}</H2>
          {session.conditioning.targetHRZone ? (
            <Muted style={{ marginTop: 4 }}>Cible : {session.conditioning.targetHRZone}</Muted>
          ) : null}
          <Body style={{ marginTop: spacing.sm }}>{session.conditioning.description}</Body>
        </Card>
      ) : null}

      {session.blocks.map((block) => (
        <Card key={block.id}>
          <Pill label={block.type} color={colors.info} />
          <H2 style={{ marginTop: spacing.sm, marginBottom: spacing.sm }}>{block.title}</H2>
          {block.exercises.map((ex) => (
            <View
              key={ex.id}
              style={{
                paddingVertical: spacing.sm,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <Row style={{ justifyContent: "space-between" }}>
                <Body style={{ fontWeight: "700", flex: 1 }}>{ex.name}</Body>
                <Body style={{ color: colors.textMuted }}>
                  {ex.sets}×{ex.reps}
                </Body>
              </Row>
              <Row style={{ marginTop: 4, gap: spacing.sm, flexWrap: "wrap" }}>
                {ex.loadHint ? <Small>· {ex.loadHint}</Small> : null}
                {ex.rest ? <Small>· repos {ex.rest}</Small> : null}
                {ex.tempo ? <Small>· tempo {ex.tempo}</Small> : null}
              </Row>
              {ex.notes ? <Muted style={{ marginTop: 4 }}>{ex.notes}</Muted> : null}
              {ex.substitution ? (
                <Muted style={{ marginTop: 2, fontStyle: "italic" }}>
                  Substitution : {ex.substitution}
                </Muted>
              ) : null}
            </View>
          ))}
        </Card>
      ))}

      <Button
        label="Démarrer la séance"
        onPress={() =>
          nav.navigate("LogSession", {
            sessionId: session.id,
            phaseIdx,
            weekIdx,
            weekday,
          })
        }
      />
    </Screen>
  );
};
