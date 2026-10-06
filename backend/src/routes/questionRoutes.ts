import express from "express";
import { deleteQuestion, getAllThemes, getQuestions, getQuestionsByTheme, postQuestion, putQuestion } from "../controllers/questionController.js";

const router = express.Router()

router.post(
    "/",
    postQuestion
)

router.put(
    "/:id",
    putQuestion
)

router.delete(
    "/:id",
    deleteQuestion
)

router.get(
    "/",
    getQuestions
)

router.get(
    "/themes",
    getAllThemes
)

router.get(
    "/:theme",
    getQuestionsByTheme
)

export default router;