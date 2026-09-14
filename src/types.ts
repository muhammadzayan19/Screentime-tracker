export type AppUsage = {
  packageName: string;
  totalTimeInForeground: number; // milliseconds
};

// date key format: "YYYY-MM-DD"
export type DayHistory = Record<string, number>; // packageName -> ms

export type HistoryStore = Record<string, DayHistory>; // dateKey -> DayHistory
