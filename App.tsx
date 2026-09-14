import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TodayScreen from "./src/screens/TodayScreen";
import HistoryScreen from "./src/screens/HistoryScreen";

type Tab = "today" | "history";

export default function App() {
  const [tab, setTab] = useState<Tab>("today");

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.appTitle}>Screentime</Text>

      <View style={styles.tabBar}>
        <TabButton
          label="Today"
          active={tab === "today"}
          onPress={() => setTab("today")}
        />
        <TabButton
          label="History"
          active={tab === "history"}
          onPress={() => setTab("history")}
        />
      </View>

      <View style={styles.content}>
        {tab === "today" ? <TodayScreen /> : <HistoryScreen />}
      </View>
    </SafeAreaView>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.tabButton} onPress={onPress}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
      {active && <View style={styles.tabIndicator} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  appTitle: {
    fontSize: 22,
    fontWeight: "700",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    paddingHorizontal: 20,
  },
  tabButton: { marginRight: 24, paddingVertical: 10 },
  tabLabel: { fontSize: 15, color: "#999", fontWeight: "500" },
  tabLabelActive: { color: "#1a1a1a" },
  tabIndicator: {
    height: 2,
    backgroundColor: "#4f6df5",
    marginTop: 8,
    borderRadius: 1,
  },
  content: { flex: 1 },
});
