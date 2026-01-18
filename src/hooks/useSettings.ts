import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface UserSettings {
  displayName: string;
  reminderTime: string; // HH:MM 24h
}

const STORAGE_KEY_PREFIX = "nw-buddy-settings";
const getStorageKey = (userId?: string | null) => `${STORAGE_KEY_PREFIX}-${userId ?? "anon"}`;

const getDefaultSettings = (user?: { displayName?: string | null }): UserSettings => ({
  displayName: user?.displayName?.trim() ?? "",
  reminderTime: "20:00",
});

function loadSettings(
  storageKey: string,
  defaultSettings: UserSettings,
  userDisplayName?: string | null
): UserSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return defaultSettings;
    const parsed = JSON.parse(stored) as Partial<UserSettings>;
    const merged: UserSettings = {
      ...defaultSettings,
      ...parsed,
    };
    // Scrub legacy hardcoded default.
    if (merged.displayName?.trim().toLowerCase() === "alex") {
      merged.displayName = userDisplayName?.trim() ?? "";
    }
    return merged;
  } catch (error) {
    console.warn("Failed to parse settings from storage", error);
    return defaultSettings;
  }
}

export function useSettings() {
  const initialUser = auth.currentUser ?? undefined;
  const [storageKey, setStorageKey] = useState<string>(() => getStorageKey(initialUser?.uid));
  const [settings, setSettings] = useState<UserSettings>(() =>
    loadSettings(storageKey, getDefaultSettings(initialUser), initialUser?.displayName)
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings, storageKey]);

  // Update storage key and reload settings when auth user changes.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const nextKey = getStorageKey(user?.uid);
      setStorageKey(nextKey);
      setSettings(loadSettings(nextKey, getDefaultSettings(user ?? undefined), user?.displayName));
    });
    return () => unsub();
  }, []);

  const updateSettings = useCallback((next: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...next }));
  }, []);

  const resetSettings = useCallback(
    () => setSettings(getDefaultSettings(auth.currentUser ?? undefined)),
    []
  );

  return { settings, updateSettings, resetSettings };
}
