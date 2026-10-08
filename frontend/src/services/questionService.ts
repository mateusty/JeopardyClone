import type { Question } from '../types/game';

const apiUrl = import.meta.env.VITE_API_URL ?? '';
const questionsUrl = `${apiUrl.replace(/\/$/, '')}/questions`;

type CatalogQuestion = Omit<Question, 'alreadyShown'> & { alreadyShown?: boolean | null };

export async function getQuestionCatalog(signal?: AbortSignal): Promise<Question[]> {
  const response = await fetch(questionsUrl, { signal });
  if (!response.ok) {
    throw new Error(`Não foi possível carregar as perguntas (HTTP ${response.status}).`);
  }

  const data: { questions: CatalogQuestion[] } = await response.json();
  if (!Array.isArray(data.questions)) {
    throw new Error('A API retornou um catálogo de perguntas inválido.');
  }

  return data.questions.map((question) => ({ ...question, alreadyShown: question.alreadyShown ?? false }));
}

export type QuestionInput = Pick<Question, 'theme' | 'points' | 'body' | 'answer' | 'mediaType' | 'mediaUrl'>;

export async function getQuestionThemes(signal?: AbortSignal): Promise<string[]> {
  const response = await fetch(`${questionsUrl}/themes`, { signal });
  if (!response.ok) {
    throw new Error(`Não foi possível carregar os temas (HTTP ${response.status}).`);
  }
  const data: { themes: Array<{ theme: string }> } = await response.json();
  if (!Array.isArray(data.themes) || data.themes.some((item) => typeof item.theme !== 'string')) {
    throw new Error('A API retornou uma lista de temas inválida.');
  }
  return data.themes.map(({ theme }) => theme).sort((first, second) => first.localeCompare(second, 'pt-BR'));
}

async function saveQuestion(url: string, method: 'POST' | 'PUT', question: QuestionInput): Promise<Question> {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(question),
  });
  if (!response.ok) {
    throw new Error(`Não foi possível ${method === 'POST' ? 'criar' : 'atualizar'} a questão (HTTP ${response.status}).`);
  }
  const data: { question: Question } = await response.json();
  if (!data.question || typeof data.question.id !== 'string') {
    throw new Error('A API retornou uma questão inválida.');
  }
  return { ...data.question, alreadyShown: data.question.alreadyShown ?? false };
}

export function createQuestion(question: QuestionInput): Promise<Question> {
  return saveQuestion(questionsUrl, 'POST', question);
}

export function updateQuestion(id: string, question: QuestionInput): Promise<Question> {
  return saveQuestion(`${questionsUrl}/${encodeURIComponent(id)}`, 'PUT', question);
}

export async function deleteQuestion(id: string): Promise<void> {
  const response = await fetch(`${questionsUrl}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`Não foi possível excluir a questão (HTTP ${response.status}).`);
  }
}
