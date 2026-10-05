export class Question {
    constructor(
        public id: string,
        public theme: string,
        public points: number,
        public body: string,
        public answer: string,
        public mediaType?: MediaType,
        public mediaUrl?: string
    ) {}
}

export enum MediaType {
    IMAGE = "IMAGE",
    AUDIO = "AUDIO",
    YOUTUBE = "YOUTUBE"
}