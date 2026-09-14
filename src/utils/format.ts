export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0 && m === 0) return "<1m";
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// Best-effort friendly names for common package names.
// Falls back to a cleaned-up version of the package name.
const KNOWN_APPS: Record<string, string> = {
  "com.whatsapp": "WhatsApp",
  "com.instagram.android": "Instagram",
  "com.facebook.katana": "Facebook",
  "com.google.android.youtube": "YouTube",
  "com.google.android.gm": "Gmail",
  "com.google.android.apps.maps": "Maps",
  "com.android.chrome": "Chrome",
  "com.twitter.android": "X / Twitter",
  "com.snapchat.android": "Snapchat",
  "com.spotify.music": "Spotify",
  "com.netflix.mediaclient": "Netflix",
  "com.discord": "Discord",
  "com.reddit.frontpage": "Reddit",
  "com.zhiliaoapp.musically": "TikTok",
  "com.google.android.apps.messaging": "Messages",
  "com.google.android.dialer": "Phone",
  "com.android.settings": "Settings",
  "com.google.android.googlequicksearchbox": "Google",
  "com.linkedin.android": "LinkedIn",
  "com.microsoft.teams": "Teams",
  "com.slack": "Slack",
};

export function friendlyAppName(packageName: string): string {
  if (KNOWN_APPS[packageName]) return KNOWN_APPS[packageName];
  const lastSegment = packageName.split(".").pop() ?? packageName;
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
}
