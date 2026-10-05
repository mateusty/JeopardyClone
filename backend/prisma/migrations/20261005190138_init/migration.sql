-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);
