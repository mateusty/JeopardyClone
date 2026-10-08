import type { QuestionRequest } from "../dtos/questionRequest.js";
import type { Question } from "../models/question.js";
import prisma from "./prisma.js";


export const createQuestion = async (question: QuestionRequest) : Promise<Question> => {
    return await prisma.question.create(
        {
            data: {
                ...question,
                mediaType: question.mediaType ?? null,
                mediaUrl: question.mediaUrl ?? null
            }
        }
    );
    
}

export const update = async (question: QuestionRequest, id: string) : Promise<Question> => {
    return await prisma.question.update({
        where: { id: id },
        data: {
                        theme: question.theme,
            points: question.points,
            body: question.body,
            answer: question.answer,
            ...(question.mediaType !== undefined && {
                mediaType: question.mediaType
            }),
            ...(question.mediaUrl !== undefined && {
                mediaUrl: question.mediaUrl
            })
        }
    })
}

export const getQuestions = async () : Promise<Question[]> => {
    return await prisma.question.findMany();
}

export const getByTheme = async (theme: string) : Promise<Question[]> => {
    return await prisma.question.findMany({
        where: {theme: theme},
    });
}

export const getThemes = async () : Promise<Pick<Question, 'theme'>[]> => {
    return await prisma.question.findMany({
        distinct: ['theme'],
        select: {
            theme: true
        }
    });
}

export const deleteById = async (id: string) => {
    await prisma.question.delete({where: {
        id: id
    }
    })
}