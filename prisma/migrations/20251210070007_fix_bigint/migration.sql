/*
  Warnings:

  - You are about to alter the column `githubId` on the `PullRequest` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `githubId` on the `Repository` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PullRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "githubId" BIGINT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "repoId" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PullRequest_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PullRequest" ("author", "createdAt", "githubId", "id", "number", "repoId", "status", "title", "updatedAt") SELECT "author", "createdAt", "githubId", "id", "number", "repoId", "status", "title", "updatedAt" FROM "PullRequest";
DROP TABLE "PullRequest";
ALTER TABLE "new_PullRequest" RENAME TO "PullRequest";
CREATE UNIQUE INDEX "PullRequest_githubId_key" ON "PullRequest"("githubId");
CREATE TABLE "new_Repository" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "githubId" BIGINT NOT NULL,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Repository" ("githubId", "id", "name") SELECT "githubId", "id", "name" FROM "Repository";
DROP TABLE "Repository";
ALTER TABLE "new_Repository" RENAME TO "Repository";
CREATE UNIQUE INDEX "Repository_githubId_key" ON "Repository"("githubId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
