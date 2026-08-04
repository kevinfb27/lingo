-- CreateTable
CREATE TABLE "vocabulary_entry" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "pronunciation" TEXT,
    "sourceLanguage" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "example" TEXT,
    "notes" TEXT,
    "isLearned" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "vocabulary_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vocabulary_entry_userId_idx" ON "vocabulary_entry"("userId");

-- CreateIndex
CREATE INDEX "vocabulary_entry_sourceLanguage_idx" ON "vocabulary_entry"("sourceLanguage");

-- CreateIndex
CREATE INDEX "vocabulary_entry_isLearned_idx" ON "vocabulary_entry"("isLearned");

-- AddForeignKey
ALTER TABLE "vocabulary_entry" ADD CONSTRAINT "vocabulary_entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
