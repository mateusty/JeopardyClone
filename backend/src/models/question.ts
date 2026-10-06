import type { MediaType } from "../generated/prisma/enums.js";

export class Question {
    constructor(
        public id: string,
        public theme: string,
        public points: number,
        public body: string,
        public answer: string,
        public mediaType: MediaType | null,
        public mediaUrl: string | null
    ) {}
}