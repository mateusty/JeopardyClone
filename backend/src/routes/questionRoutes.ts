import express from "express";
import { getQuestions, postQuestion } from "../controllers/questionController.js";

const router = express.Router()

router.post(
    "/",
    postQuestion
)

router.get(
    "/",
    getQuestions
)

export default router;