import { Platform } from "react-native";
import {
  EventFrequency,
  checkForPermission,
  queryUsageStats,
  showUsageAccessSettings,
} from "@brighthustle/react-native-usage-stats-manager";
import { AppUsage } from "../types";

export function isSupported(): boolean {
  return Platform.OS === "android";
}

export async function hasPermission(): Promise<boolean> {
  if (!isSupported()) return false;
  try {
    return await checkForPermission();
  } catch {
    return false;
  }
}

export function openPermissionSettings(): void {
  if (!isSupported()) return;
  showUsageAccessSettings("");
}

export type UsageDebugInfo = {
  permission: boolean;
  rawType: string;
  rawPreview: string;
  parsedCount: number;
  error: string | null;
};

export async function getDebugInfo(): Promise<UsageDebugInfo> {
  const permission = await hasPermission();
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  try {
    const raw = await queryUsageStats(
      EventFrequency.INTERVAL_DAILY,
      start.getTime(),
      now.getTime()
    );
    const rawType = Array.isArray(raw) ? "array" : typeof raw;
    const rawPreview = JSON.stringify(raw)?.slice(0, 300) ?? "null";
    const list: any[] = Array.isArray(raw)
      ? raw
      : typeof raw === "string"
      ? JSON.parse(raw || "[]")
      : [];
    return {
      permission,
      rawType,
      rawPreview,
      parsedCount: list.length,
      error: null,
    };
  } catch (e: any) {
    return {
      permission,
      rawType: "error",
      rawPreview: "",
      parsedCount: 0,
      error: String(e?.message ?? e),
    };
  }
}

export async function getUsageForRange(
  start: Date,
  end: Date
): Promise<AppUsage[]> {
  if (!isSupported()) return [];

  const raw = await queryUsageStats(
    EventFrequency.INTERVAL_DAILY,
    start.getTime(),
    end.getTime()
  );

  const list: any[] = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
    ? JSON.parse(raw || "[]")
    : [];

  const byPackage = new Map<string, number>();
  for (const entry of list) {
    const pkg: string = entry.packageName ?? entry.PackageName;
    const time: number = Number(
      entry.totalTimeInForeground ?? entry.TotalTimeInForeground ?? 0
    );
    if (!pkg || time <= 0) continue;
    byPackage.set(pkg, (byPackage.get(pkg) ?? 0) + time);
  }

  return Array.from(byPackage.entries())
    .map(([packageName, totalTimeInForeground]) => ({
      packageName,
      totalTimeInForeground,
    }))
    .sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground);
}
