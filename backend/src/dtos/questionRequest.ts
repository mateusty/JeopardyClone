import type { MediaType } from "express";

export class QuestionRequest {
    constructor(
            public theme: string,
            public points: number,
            public body: string,
            public answer: string,
            public mediaType?: MediaType,
            public mediaUrl?: string
        ) {}
}