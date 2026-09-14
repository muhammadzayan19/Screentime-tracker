import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { getHistory } from "../storage/history";
import { HistoryStore, DayHistory } from "../types";
import { formatDuration } from "../utils/format";
import AppUsageRow from "../components/AppUsageRow";

function dayTotal(day: DayHistory): number {
  return Object.values(day).reduce((sum, ms) => sum + ms, 0);
}

export default function HistoryScreen() {
  const [store, setStore] = useState<HistoryStore>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStore(await getHistory());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const days = Object.keys(store).sort((a, b) => (a < b ? 1 : -1));

  if (selectedKey && store[selectedKey]) {
    const day = store[selectedKey];
    const entries = Object.entries(day).sort((a, b) => b[1] - a[1]);
    const maxMs = entries.length > 0 ? entries[0][1] : 0;

    return (
      <FlatList
        data={entries}
        keyExtractor={([pkg]) => pkg}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Pressable onPress={() => setSelectedKey(null)}>
              <Text style={styles.back}>‹ All days</Text>
            </Pressable>
            <Text style={styles.dayTitle}>{selectedKey}</Text>
            <Text style={styles.totalValue}>
              {formatDuration(dayTotal(day))}
            </Text>
          </View>
        }
        renderItem={({ item: [pkg, ms] }) => (
          <AppUsageRow packageName={pkg} ms={ms} maxMs={maxMs} />
        )}
      />
    );
  }

  return (
    <FlatList
      data={days}
      keyExtractor={(k) => k}
      contentContainerStyle={styles.list}
      renderItem={({ item: key }) => (
        <Pressable
          style={styles.dayRow}
          onPress={() => setSelectedKey(key)}
        >
          <Text style={styles.dayLabel}>{key}</Text>
          <Text style={styles.dayValue}>
            {formatDuration(dayTotal(store[key]))}
          </Text>
        </Pressable>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>
          No history yet. Open the Today tab first so it can start logging.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 20 },
  header: { marginBottom: 16 },
  back: { color: "#4f6df5", fontSize: 15, marginBottom: 10 },
  dayTitle: { fontSize: 14, color: "#666" },
  totalValue: { fontSize: 28, fontWeight: "700", color: "#1a1a1a" },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  dayLabel: { fontSize: 15, color: "#1a1a1a" },
  dayValue: { fontSize: 15, color: "#666" },
  empty: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 40 },
});
