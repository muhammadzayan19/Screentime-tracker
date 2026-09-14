import AsyncStorage from "@react-native-async-storage/async-storage";
import { DayHistory, HistoryStore } from "../types";
import { dateKey, startOfDay } from "../utils/format";
import { getUsageForRange, isSupported } from "../api/usageStats";

const STORAGE_KEY = "screentime:history:v1";
const BACKFILL_DAYS = 14; // how far back to try pulling on first run

async function readStore(): Promise<HistoryStore> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function writeStore(store: HistoryStore): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function toDayHistory(usage: { packageName: string; totalTimeInForeground: number }[]): DayHistory {
  const day: DayHistory = {};
  for (const u of usage) day[u.packageName] = u.totalTimeInForeground;
  return day;
}

/**
 * Pulls today's usage from the OS and overwrites today's entry in our
 * own permanent log (today's totals only grow through the day, so
 * overwriting is safe and keeps it current).
 */
export async function refreshToday(): Promise<DayHistory> {
  if (!isSupported()) return {};
  const now = new Date();
  const start = startOfDay(now);
  const usage = await getUsageForRange(start, now);
  const day = toDayHistory(usage);

  const store = await readStore();
  store[dateKey(now)] = day;
  await writeStore(store);
  return day;
}

/**
 * On first run (or whenever called), fills in any of the last
 * BACKFILL_DAYS days we don't already have saved, using whatever
 * history Android's UsageStatsManager still has on-device. This is
 * best-effort: the OS only retains fine-grained stats for a limited
 * window, older days may come back empty.
 */
export async function backfillHistory(): Promise<void> {
  if (!isSupported()) return;
  const store = await readStore();
  const today = new Date();

  for (let i = 1; i <= BACKFILL_DAYS; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const key = dateKey(day);
    if (store[key]) continue; // already have it, don't overwrite

    const start = startOfDay(day);
    const end = startOfDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() - i + 1));
    const usage = await getUsageForRange(start, end);
    if (usage.length > 0) {
      store[key] = toDayHistory(usage);
    }
  }

  await writeStore(store);
}

export async function getHistory(): Promise<HistoryStore> {
  return readStore();
}

export async function getDay(key: string): Promise<DayHistory | undefined> {
  const store = await readStore();
  return store[key];
}
