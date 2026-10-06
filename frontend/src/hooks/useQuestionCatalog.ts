import { useEffect, useState } from 'react';
import { getQuestionCatalog } from '../services/questionService';
import type { Question } from '../types/game';

interface QuestionCatalogState {
  questions: Question[];
  isLoading: boolean;
  error: string | null;
}

export function useQuestionCatalog(): QuestionCatalogState {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getQuestionCatalog(controller.signal)
      .then(setQuestions)
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return;
        setError(cause instanceof Error ? cause.message : 'Erro inesperado ao carregar o catálogo.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { questions, isLoading, error };
}
