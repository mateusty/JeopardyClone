import type { Request, Response } from "express";
import type { QuestionRequest } from "../dtos/questionRequest.js";
import { create, getAll } from "../services/questionService.js";
import type { Question } from "../models/question.js";

export async function postQuestion(req: Request, res: Response) {
    const data: QuestionRequest = req.body;
    const question: Question = await create(data)
    res.send({question});
}

export async function getQuestions(req: Request, res: Response) {
    const questions: Question[] = await getAll();

    res.send({questions});
}