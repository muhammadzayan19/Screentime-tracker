import { Platform } from "react-native";
import {
  EventFrequency,
  checkForPermission,
  queryUsageStats,
  showUsageAccessSettings,
} from "@brighthustle/react-native-usage-stats-manager";
import { AppUsage } from "../types";

/**
 * Android exposes per-app foreground time via UsageStatsManager, gated
 * behind a special "Usage access" permission the user must grant manually
 * in system Settings (it can't be requested through a normal permission
 * dialog). iOS does not expose this data to third-party apps at all
 * (Apple's Screen Time / DeviceActivity APIs are locked to entitlement-
 * gated parental-control use cases), so this module is Android-only.
 */

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

/**
 * Returns per-app foreground usage (ms) for the half-open range [start, end).
 */
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

  // The native module returns an array (sometimes stringified JSON
  // depending on platform version), normalize both shapes.
  const list: any[] = Array.isArray(raw) ? raw : JSON.parse(raw ?? "[]");

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
