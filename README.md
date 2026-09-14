# Screentime Tracker

Minimal React Native (Expo) app that shows how much time you spent in each
app today, and keeps a daily history on-device.

## Important: Android only

Real per-app screen time requires the OS to expose it, and only Android does
that to third-party apps (via `UsageStatsManager`). iOS's equivalent
(`FamilyControls` / `DeviceActivity`, aka "Screen Time API") is locked behind
a special Apple entitlement meant for parental-control apps — a regular app
cannot read another app's usage on iOS. This project targets Android; if you
run it on iOS it'll show a "not supported" message rather than fake data.

## How it works

- Uses `@brighthustle/react-native-usage-stats-manager` to query Android's
  `UsageStatsManager` for per-app foreground time.
- Reading usage stats requires the **"Usage access"** special permission,
  which the user has to grant manually in system Settings — Android doesn't
  allow requesting it via a normal permission popup. The app detects this and
  shows a button that opens the right settings screen.
- Because this permission needs a native module, you **cannot use Expo Go**
  — you need a dev client / prebuilt app (see below).
- On every app open, today's totals are read from the OS and saved into the
  app's own permanent log (AsyncStorage), so your history survives even
  after Android's own retention window for that data passes. It also tries
  to backfill the last 14 days on first run from whatever the OS still has.

## Setup

```bash
npm install
npx expo prebuild -p android
npx expo run:android
```

First launch:
1. The app will say permission is needed — tap **Open Settings**.
2. In the "Usage access" list, find **Screentime** and turn it on.
3. Go back to the app and tap **"I granted it, refresh"**.

## Project layout

```
App.tsx                      root component, Today/History tab switcher
src/api/usageStats.ts        native module wrapper + permission helpers
src/storage/history.ts       AsyncStorage log, daily snapshot + backfill
src/screens/TodayScreen.tsx  today's per-app breakdown
src/screens/HistoryScreen.tsx list of past days -> per-app breakdown
src/components/AppUsageRow.tsx  app name + bar + duration
src/utils/format.ts          duration formatting, date keys, friendly app names
src/types.ts                 shared types
```

## Known limitations

- App names are shown via a small built-in dictionary of common package
  names (WhatsApp, Instagram, YouTube, etc.); anything not in that list
  falls back to a cleaned-up package name (e.g. `com.foo.bar` → "Bar").
  Add more entries to `KNOWN_APPS` in `src/utils/format.ts` as needed.
- History only starts accumulating once you've opened the app — it isn't a
  background service, so if you don't open it for several days you'll only
  get whatever backfill the OS retention window still has.
- Some OEMs (Samsung, Xiaomi, Huawei) throttle background stats; if numbers
  look off, disable battery optimization for the app.
