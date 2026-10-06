import type { MediaType } from "../generated/prisma/enums.js";

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