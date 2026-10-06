import type { Question } from '../types/game';

const apiUrl = import.meta.env.VITE_API_URL ?? '';

export async function getQuestionCatalog(signal?: AbortSignal): Promise<Question[]> {
  const response = await fetch(`${apiUrl}/questions`, { signal });
  if (!response.ok) {
    throw new Error(`Não foi possível carregar as perguntas (HTTP ${response.status}).`);
  }

  const data: { questions: Question[] } = await response.json();
  return data.questions;
}
