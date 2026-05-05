import React from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Body,
  Button,
  Card,
  H1,
  H2,
  Muted,
  Row,
  Screen,
  Segmented,
  Small,
} from "../../components/ui";
import { spacing } from "../../app/theme";
import { useAppStore } from "../../data/store";
import { RootStackParamList } from "../../app/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const SettingsScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const settings = useAppStore((s) => s.settings);
  const setUnit = useAppStore((s) => s.setUnit);
  const resetDemo = useAppStore((s) => s.resetDemoData);
  const clearAll = useAppStore((s) => s.clearAllData);
  const updateSchedule = useAppStore((s) => s.updateSchedule);

  return (
    <Screen>
      <Small>RÉGLAGES</Small>
      <H1 style={{ marginTop: 4, marginBottom: spacing.lg }}>Paramètres</H1>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Unité de poids</H2>
        <Segmented
          options={[
            { value: "kg", label: "Kilogrammes" },
            { value: "lb", label: "Livres" },
          ]}
          value={settings.unit}
          onChange={(v) => setUnit(v as "kg" | "lb")}
        />
      </Card>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Planning JJB & semaine</H2>
        <Muted>
          Modifie les jours et heures de tes JJB. L'app réorganise les séances S&C, conditioning
          et récupération autour, en gardant la priorité performance JJB et la prudence bas du dos.
        </Muted>
        <Button
          label="Configurer le planning"
          variant="secondary"
          onPress={() => nav.navigate("ScheduleSettings")}
          style={{ marginTop: spacing.md }}
        />
      </Card>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Bas du dos</H2>
        <Row style={{ justifyContent: "space-between" }}>
          <Body>Mode prudence</Body>
          <Segmented
            options={[
              { value: "on", label: "Activé" },
              { value: "off", label: "Désactivé" },
            ]}
            value={settings.schedule.lowBackCaution ? "on" : "off"}
            onChange={(v) => updateSchedule({ lowBackCaution: v === "on" })}
          />
        </Row>
        <Muted style={{ marginTop: spacing.sm }}>
          Privilégie hip thrust, évite les hinges lourds, et recommande la vigilance sur RDL / squat lourd.
        </Muted>
      </Card>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Synchronisation cloud</H2>
        <Muted style={{ marginBottom: spacing.md }}>
          Sauvegarde tes données sur Supabase pour les retrouver sur tout appareil.
          L'app reste utilisable sans connexion.
        </Muted>
        <Button
          label="Configurer la sync cloud"
          variant="secondary"
          onPress={() => nav.navigate("Auth")}
        />
      </Card>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>Données</H2>
        <Button
          label="Réinjecter les données de démo"
          variant="secondary"
          onPress={() => {
            Alert.alert(
              "Réinjecter la démo",
              "Cela remplacera tous les logs par des données réalistes de démonstration.",
              [
                { text: "Annuler", style: "cancel" },
                { text: "Réinjecter", onPress: resetDemo },
              ]
            );
          }}
          style={{ marginBottom: spacing.sm }}
        />
        <Button
          label="Effacer tous les logs"
          variant="danger"
          onPress={() => {
            Alert.alert(
              "Effacer ?",
              "Toutes tes données de logs seront supprimées. Le programme reste.",
              [
                { text: "Annuler", style: "cancel" },
                { text: "Effacer", style: "destructive", onPress: clearAll },
              ]
            );
          }}
        />
      </Card>

      <Card>
        <H2 style={{ marginBottom: spacing.sm }}>À propos</H2>
        <Muted>
          App de préparation physique JJB inspirée de Joel Jamieson (systèmes énergétiques),
          Phil Daru (structure de séance combat), Ground Control (stabilité contralatérale) et
          FRC (mobilité utile). Pas un système médical — guidance simple basée sur tes données.
        </Muted>
      </Card>
    </Screen>
  );
};
