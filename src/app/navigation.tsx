import React from "react";
import { Text, View } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { colors } from "./theme";
import { HomeScreen } from "../features/home/HomeScreen";
import { PlanScreen } from "../features/plan/PlanScreen";
import { LogScreen } from "../features/log/LogScreen";
import { LogSessionScreen } from "../features/log/LogSessionScreen";
import { SessionDetailScreen } from "../features/plan/SessionDetailScreen";
import { CheckinScreen } from "../features/checkin/CheckinScreen";
import { ConditioningScreen } from "../features/conditioning/ConditioningScreen";
import { BodyMetricsScreen } from "../features/body/BodyMetricsScreen";
import { StatsScreen } from "../features/stats/StatsScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { ScheduleSettingsScreen } from "../features/settings/ScheduleSettingsScreen";
import { AuthScreen } from "../features/auth/AuthScreen";
import { ExerciseHistoryScreen } from "../features/history/ExerciseHistoryScreen";

export type RootStackParamList = {
  Tabs: undefined;
  SessionDetail: {
    sessionId: string;
    phaseIdx: number;
    weekIdx: number;
    weekday: number;
  };
  LogSession: {
    sessionId: string;
    phaseIdx: number;
    weekIdx: number;
    weekday: number;
  };
  Checkin: undefined;
  Conditioning: undefined;
  BodyMetrics: undefined;
  ScheduleSettings: undefined;
  Auth: undefined;
  ExerciseHistory: { exerciseName: string };
};

export type TabParamList = {
  Home: undefined;
  Plan: undefined;
  Log: undefined;
  Stats: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabIcon: React.FC<{ label: string; focused: boolean }> = ({
  label,
  focused,
}) => (
  <View style={{ alignItems: "center" }}>
    <Text
      style={{
        color: focused ? colors.accent : colors.textDim,
        fontWeight: "800",
        fontSize: 11,
        letterSpacing: 0.8,
        textTransform: "uppercase",
      }}
    >
      {label}
    </Text>
  </View>
);

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgElev,
          borderTopColor: colors.border,
          height: 64,
          paddingTop: 10,
          paddingBottom: 12,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Plan" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Log"
        component={LogScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Log" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Stats" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Réglages" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgElev,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

export const RootNavigation: React.FC = () => (
  <NavigationContainer theme={navTheme}>
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgElev },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={Tabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailScreen}
        options={{ title: "Séance" }}
      />
      <Stack.Screen
        name="LogSession"
        component={LogSessionScreen}
        options={{ title: "Logger" }}
      />
      <Stack.Screen
        name="Checkin"
        component={CheckinScreen}
        options={{ title: "Check-in" }}
      />
      <Stack.Screen
        name="Conditioning"
        component={ConditioningScreen}
        options={{ title: "Conditioning" }}
      />
      <Stack.Screen
        name="BodyMetrics"
        component={BodyMetricsScreen}
        options={{ title: "Mensurations" }}
      />
      <Stack.Screen
        name="ScheduleSettings"
        component={ScheduleSettingsScreen}
        options={{ title: "Planning" }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ title: "Sync cloud" }}
      />
      <Stack.Screen
        name="ExerciseHistory"
        component={ExerciseHistoryScreen}
        options={({ route }) => ({ title: route.params.exerciseName })}
      />
    </Stack.Navigator>
  </NavigationContainer>
);
