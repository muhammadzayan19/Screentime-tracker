import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatDuration, friendlyAppName } from "../utils/format";

type Props = {
  packageName: string;
  ms: number;
  maxMs: number;
};

export default function AppUsageRow({ packageName, ms, maxMs }: Props) {
  const pct = maxMs > 0 ? Math.max(4, Math.round((ms / maxMs) * 100)) : 0;

  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        <Text style={styles.name} numberOfLines={1}>
          {friendlyAppName(packageName)}
        </Text>
        <Text style={styles.time}>{formatDuration(ms)}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 14 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: { fontSize: 15, fontWeight: "500", color: "#1a1a1a", flex: 1 },
  time: { fontSize: 14, color: "#666", marginLeft: 8 },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#eee",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#4f6df5",
  },
});
