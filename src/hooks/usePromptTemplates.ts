import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { DEFAULT_PROMPTS, PROMPT_ORDER, type PromptId, type PromptResponse, buildPromptsFromTemplate } from "@/lib/prompts";

const STORAGE_KEY_PREFIX = "nw-prompt-template-v2";
const LEGACY_KEYS = ["nw-prompt-template", "nw-prompt-template-v2"];

const getStorageKey = (userId?: string | null) => `${STORAGE_KEY_PREFIX}-${userId ?? "anon"}`;
const MAX_PROMPTS = 8;
const MAX_QUESTION_LENGTH = 140;

function loadTemplate(storageKey: string): PromptResponse[] {
  if (typeof window === "undefined") return DEFAULT_PROMPTS.map((p) => ({ ...p }));
  try {
    // One-time migration: drop legacy cached templates to avoid stale ordering.
    LEGACY_KEYS.forEach((key) => {
      if (window.localStorage.getItem(key)) {
        window.localStorage.removeItem(key);
      }
    });

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return DEFAULT_PROMPTS.map((p) => ({ ...p }));
    const parsed = JSON.parse(raw) as PromptResponse[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PROMPTS.map((p) => ({ ...p }));
    // Basic validation
    const sanitized = parsed
      .slice(0, MAX_PROMPTS)
      .map((p, idx) => ({
        id: (p && p.id) || `custom-${idx}`,
        question: typeof p.question === "string" && p.question.trim() ? p.question.trim().slice(0, MAX_QUESTION_LENGTH) : "",
        answer: "",
      }))
      // Drop customs with empty questions to avoid duplicate “Journal” placeholders.
      .filter((p) => PROMPT_ORDER.includes(p.id as PromptId) || (p.question && p.question.trim()));

    // Keep defaults in canonical order and append customs after.
    return buildPromptsFromTemplate(sanitized);
  } catch (e) {
    console.warn("Failed to load prompt template", e);
    return DEFAULT_PROMPTS.map((p) => ({ ...p }));
  }
}

function persistTemplate(storageKey: string, template: PromptResponse[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(template.map(({ answer, ...rest }) => rest)));
  } catch (e) {
    console.warn("Failed to persist prompt template", e);
  }
}

function migrateAnonTemplateToUser(anonKey: string, userKey: string) {
  if (typeof window === "undefined") return;
  try {
    const anonValue = window.localStorage.getItem(anonKey);
    const userValue = window.localStorage.getItem(userKey);
    if (anonValue && !userValue) {
      window.localStorage.setItem(userKey, anonValue);
    }
  } catch (e) {
    console.warn("Failed to migrate prompt template", e);
  }
}

export function usePromptTemplates() {
  const [userId, setUserId] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [storageKey, setStorageKey] = useState<string>(getStorageKey(auth.currentUser?.uid));
  const [template, setTemplate] = useState<PromptResponse[]>(() => loadTemplate(storageKey));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    persistTemplate(storageKey, template);
  }, [template, storageKey]);

  // React to auth changes so each user has isolated templates.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const nextUid = user?.uid ?? null;
      const nextKey = getStorageKey(nextUid);
      const anonKey = getStorageKey(null);
      // If we just signed in and have prompts from anon storage, migrate them once.
      if (nextUid) {
        migrateAnonTemplateToUser(anonKey, nextKey);
      }
      setUserId(nextUid);
      setStorageKey(nextKey);
      setTemplate(loadTemplate(nextKey));
    });
    return () => unsub();
  }, []);

  const updateQuestion = useCallback((id: PromptId, question: string) => {
    setTemplate((prev) =>
      prev.map((p) => (p.id === id ? { ...p, question: question.trim().slice(0, MAX_QUESTION_LENGTH) } : p))
    );
  }, []);

  const addQuestion = useCallback((question: string): string | null => {
    setError(null);
    if (!question.trim()) {
      setError("Question cannot be empty.");
      return null;
    }
    let newId: string | null = null;
    setTemplate((prev) => {
      const cleaned = prev.filter((p) => p.question && p.question.trim());
      const customs = cleaned.filter((p) => !PROMPT_ORDER.includes(p.id as PromptId));
      const maxCustoms = MAX_PROMPTS - PROMPT_ORDER.length;
      if (customs.length >= maxCustoms) {
        setError(`You can have at most ${MAX_PROMPTS} questions.`);
        return cleaned;
      }
      newId = `custom-${Date.now()}`;
      return [...cleaned, { id: newId, question: question.trim().slice(0, MAX_QUESTION_LENGTH), answer: "" }];
    });
    return newId;
  }, []);

  const deleteQuestion = useCallback((id: PromptId) => {
    setTemplate((prev) => {
      const next = prev.filter((p) => p.id !== id);
      // Prevent deleting all; keep at least one prompt
      return next.length > 0 ? next : prev;
    });
  }, []);

  const resetTemplate = useCallback(() => {
    setTemplate(DEFAULT_PROMPTS.map((p) => ({ ...p })));
    setError(null);
  }, []);

  return { template, updateQuestion, addQuestion, deleteQuestion, resetTemplate, error };
}
