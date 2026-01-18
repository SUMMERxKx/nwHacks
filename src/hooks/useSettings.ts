import { useCallback, useEffect, useState } from "react";

export type BuddyTone = "direct" | "balanced" | "gentle";

export interface UserSettings {
  displayName: string;
  reminderTime: string; // HH:MM 24h
  tone: BuddyTone;
}

const STORAGE_KEY = "nw-buddy-settings";

const DEFAULT_SETTINGS: UserSettings = {
  displayName: "Alex",
  reminderTime: "20:00",
  tone: "balanced",
};

function loadSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(stored) as Partial<UserSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch (error) {
    console.warn("Failed to parse settings from storage", error);
    return DEFAULT_SETTINGS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(loadSettings);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((next: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...next }));
  }, []);

  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  return { settings, updateSettings, resetSettings, DEFAULT_SETTINGS };
}
