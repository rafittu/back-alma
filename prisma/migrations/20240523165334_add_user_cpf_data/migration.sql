/*
  Warnings:

  - Added the required column `cpf` to the `users_personal_info` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `born_date` on the `users_personal_info` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "users_personal_info" ADD COLUMN     "cpf" VARCHAR(11) NOT NULL,
DROP COLUMN "born_date",
ADD COLUMN     "born_date" TIMESTAMP(3) NOT NULL;
