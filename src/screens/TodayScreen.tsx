import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  Platform,
} from "react-native";
import {
  hasPermission,
  openPermissionSettings,
  isSupported,
  getDebugInfo,
  UsageDebugInfo,
} from "../api/usageStats";
import { refreshToday, backfillHistory } from "../storage/history";
import { DayHistory } from "../types";
import { formatDuration } from "../utils/format";
import AppUsageRow from "../components/AppUsageRow";

export default function TodayScreen() {
  const [granted, setGranted] = useState<boolean | null>(null);
  const [day, setDay] = useState<DayHistory>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [debug, setDebug] = useState<UsageDebugInfo | null>(null);

  const load = useCallback(async () => {
    if (!isSupported()) {
      setGranted(false);
      return;
    }
    const ok = await hasPermission();
    setGranted(ok);
    if (ok) {
      try {
        setLoadError(null);
        const [today] = await Promise.all([refreshToday(), backfillHistory()]);
        setDay(today);
      } catch (e: any) {
        setLoadError(String(e?.message ?? e));
      }
    }
  }, []);

  const runDebug = async () => {
    setDebug(await getDebugInfo());
  };

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!isSupported()) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Not supported</Text>
        <Text style={styles.body}>
          Per-app screen time isn't available to third-party apps on{" "}
          {Platform.OS === "ios" ? "iOS" : "this platform"}. This tracker
          works on Android via the system Usage Access permission.
        </Text>
      </View>
    );
  }

  if (granted === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Permission needed</Text>
        <Text style={styles.body}>
          Grant "Usage access" so the app can read per-app screen time.
        </Text>
        <Pressable
          style={styles.button}
          onPress={() => {
            openPermissionSettings();
          }}
        >
          <Text style={styles.buttonText}>Open Settings</Text>
        </Pressable>
        <Pressable style={styles.linkButton} onPress={load}>
          <Text style={styles.linkText}>I granted it, refresh</Text>
        </Pressable>
      </View>
    );
  }

  const entries = Object.entries(day).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, ms]) => sum + ms, 0);
  const maxMs = entries.length > 0 ? entries[0][1] : 0;

  return (
    <FlatList
      data={entries}
      keyExtractor={([pkg]) => pkg}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.totalLabel}>Total screen time today</Text>
          <Text style={styles.totalValue}>{formatDuration(total)}</Text>
        </View>
      }
      renderItem={({ item: [pkg, ms] }) => (
        <AppUsageRow packageName={pkg} ms={ms} maxMs={maxMs} />
      )}
      ListEmptyComponent={
        <View>
          {loadError && (
            <Text style={[styles.body, styles.errorText]}>
              Error loading usage: {loadError}
            </Text>
          )}
          <Text style={styles.body}>
            No usage recorded yet today. Pull to refresh after using some apps.
          </Text>
          <Pressable style={styles.linkButton} onPress={runDebug}>
            <Text style={styles.linkText}>Run diagnostics</Text>
          </Pressable>
          {debug && (
            <View style={styles.debugBox}>
              <Text style={styles.debugText}>permission: {String(debug.permission)}</Text>
              <Text style={styles.debugText}>rawType: {debug.rawType}</Text>
              <Text style={styles.debugText}>parsedCount: {debug.parsedCount}</Text>
              {debug.error && <Text style={styles.debugText}>error: {debug.error}</Text>}
              <Text style={styles.debugText}>preview: {debug.rawPreview}</Text>
            </View>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  body: { fontSize: 14, color: "#666", textAlign: "center", lineHeight: 20 },
  button: {
    marginTop: 20,
    backgroundColor: "#4f6df5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  linkButton: { marginTop: 14 },
  linkText: { color: "#4f6df5", fontSize: 14 },
  list: { padding: 20 },
  header: { marginBottom: 20 },
  totalLabel: { fontSize: 14, color: "#666" },
  totalValue: { fontSize: 32, fontWeight: "700", color: "#1a1a1a" },
  errorText: { color: "#c0392b", marginBottom: 10 },
  debugBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  debugText: { fontSize: 12, color: "#333", fontFamily: "monospace", marginBottom: 4 },
});
