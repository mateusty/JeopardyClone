import type { QuestionRequest } from "../dtos/questionRequest.js";
import type { Question } from "../models/question.js";
import prisma from "./prisma.js";


export const createQuestion = async (question: QuestionRequest) : Promise<Question> => {
    return await prisma.question.create({data: question});

}

export const getQuestions = async () : Promise<Question[]> => {
    return await prisma.question.findMany();
}

export const deleteQuestion = async (id: string) => {
    await prisma.question.delete({where: {
        id: id
    }
    })
}

export const deleteAllQuestions = async () => {
    await prisma.question.deleteMany();
}