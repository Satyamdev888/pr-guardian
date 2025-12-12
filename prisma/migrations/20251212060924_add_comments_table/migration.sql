-- CreateTable
CREATE TABLE "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "githubId" BIGINT NOT NULL,
    "body" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "prId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_prId_fkey" FOREIGN KEY ("prId") REFERENCES "PullRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Comment_githubId_key" ON "Comment"("githubId");
