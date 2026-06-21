import { useState, useCallback, useEffect } from 'react';

interface DraftState {
  questionId: string;
  answer: string;
  timestamp: number;
}

const STORAGE_KEY = 'aim_answer_drafts';

function loadDrafts(): Record<string, DraftState> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDrafts(drafts: Record<string, DraftState>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // storage full or unavailable
  }
}

export function useAnswerDraft(questionId: string) {
  const [draft, setDraft] = useState(() => {
    const drafts = loadDrafts();
    return drafts[questionId]?.answer || '';
  });

  useEffect(() => {
    const drafts = loadDrafts();
    setDraft(drafts[questionId]?.answer || '');
  }, [questionId]);

  const updateDraft = useCallback((answer: string) => {
    setDraft(answer);
    const drafts = loadDrafts();
    drafts[questionId] = { questionId, answer, timestamp: Date.now() };
    saveDrafts(drafts);
  }, [questionId]);

  const clearDraft = useCallback(() => {
    setDraft('');
    const drafts = loadDrafts();
    delete drafts[questionId];
    saveDrafts(drafts);
  }, [questionId]);

  const clearAllDrafts = useCallback(() => {
    setDraft('');
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { draft, updateDraft, clearDraft, clearAllDrafts };
}
