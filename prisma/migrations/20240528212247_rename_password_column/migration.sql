/*
  Warnings:

  - You are about to drop the column `password` on the `users_security_info` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `users_security_info` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[recover_token]` on the table `users_security_info` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hashed_password` to the `users_security_info` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users_security_info" DROP COLUMN "password",
ADD COLUMN     "hashed_password" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_security_info_id_key" ON "users_security_info"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_security_info_recover_token_key" ON "users_security_info"("recover_token");
