import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PROMPTS, type PromptId, type PromptResponse } from "@/lib/prompts";

const STORAGE_KEY = "nw-prompt-template";
const MAX_PROMPTS = 8;
const MAX_QUESTION_LENGTH = 140;

function loadTemplate(): PromptResponse[] {
  if (typeof window === "undefined") return DEFAULT_PROMPTS.map((p) => ({ ...p }));
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROMPTS.map((p) => ({ ...p }));
    const parsed = JSON.parse(raw) as PromptResponse[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PROMPTS.map((p) => ({ ...p }));
    // Basic validation
    return parsed
      .slice(0, MAX_PROMPTS)
      .map((p, idx) => ({
        id: (p && p.id) || `custom-${idx}`,
        question: typeof p.question === "string" && p.question.trim() ? p.question.trim().slice(0, MAX_QUESTION_LENGTH) : "Journal",
        answer: "",
      }));
  } catch (e) {
    console.warn("Failed to load prompt template", e);
    return DEFAULT_PROMPTS.map((p) => ({ ...p }));
  }
}

function persistTemplate(template: PromptResponse[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(template.map(({ answer, ...rest }) => rest)));
  } catch (e) {
    console.warn("Failed to persist prompt template", e);
  }
}

export function usePromptTemplates() {
  const [template, setTemplate] = useState<PromptResponse[]>(loadTemplate);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    persistTemplate(template);
  }, [template]);

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
      if (prev.length >= MAX_PROMPTS) {
        setError(`You can have at most ${MAX_PROMPTS} questions.`);
        return prev;
      }
      newId = `custom-${Date.now()}`;
      return [...prev, { id: newId, question: question.trim().slice(0, MAX_QUESTION_LENGTH), answer: "" }];
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
