import type { QuestionRequest } from "../dtos/questionRequest.js";
import type { Question } from "../models/question.js";
import { createQuestion, getQuestions } from "../repositories/questionRepository.js";

export const create = async (question: QuestionRequest): Promise<Question> => {
    return await createQuestion(question);
}

export const getAll = async (): Promise<Question[]> => {
    return await getQuestions();
}