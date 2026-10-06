import type { Request, Response } from "express";
import type { QuestionRequest } from "../dtos/questionRequest.js";
import { create, getAll } from "../services/questionService.js";
import type { Question } from "../models/question.js";
import { deleteById, getByTheme, getThemes, update } from "../repositories/questionRepository.js";

export async function postQuestion(req: Request, res: Response) {
    const data: QuestionRequest = req.body;
    const question: Question = await create(data)
    res.send({question});
}

export async function putQuestion(req: Request<{id: string}>, res: Response) {
    const data: QuestionRequest = req.body;
    const question: Question = await update(data, req.params.id);
    res.send({question});
}

export async function deleteQuestion(req: Request<{id: string}>, res: Response) {
    await deleteById(req.params.id);
    res.status(204).json({message: 'Questão deletada com sucesso!'})
}

export async function getQuestions(req: Request, res: Response) {
    const questions: Question[] = await getAll();

    res.send({questions});
}

export async function getQuestionsByTheme(req: Request<{theme: string}>, res: Response) {
    const questions: Question[] = await getByTheme(req.params.theme);

    res.send({questions});
}

export async function getAllThemes(req: Request, res: Response) {
    const themes : Pick<Question, 'theme'>[] = await getThemes();

    res.send({themes});
}
