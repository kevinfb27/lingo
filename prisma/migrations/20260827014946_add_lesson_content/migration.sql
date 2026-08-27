-- CreateEnum
CREATE TYPE "LessonContentType" AS ENUM ('INTRO', 'VOCABULARY', 'GRAMMAR', 'EXAMPLE', 'TIP');

-- CreateTable
CREATE TABLE "lesson_content_block" (
    "id" TEXT NOT NULL,
    "type" "LessonContentType" NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "items" JSONB,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "lesson_content_block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lesson_content_block_lessonId_idx" ON "lesson_content_block"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_content_block_lessonId_order_key" ON "lesson_content_block"("lessonId", "order");

-- AddForeignKey
ALTER TABLE "lesson_content_block" ADD CONSTRAINT "lesson_content_block_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
