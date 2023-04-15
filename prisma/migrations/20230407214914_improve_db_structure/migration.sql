/*
  Warnings:

  - You are about to drop the column `born_date` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `confirmation_token` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `ip_address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mother_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `recover_token` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `salt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `social_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - Added the required column `userContactInfoId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userPersonalInfoId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userSecurityInfoId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_confirmation_token_key";

-- DropIndex
DROP INDEX "users_email_key";

-- DropIndex
DROP INDEX "users_phone_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "born_date",
DROP COLUMN "confirmation_token",
DROP COLUMN "created_at",
DROP COLUMN "email",
DROP COLUMN "first_name",
DROP COLUMN "ip_address",
DROP COLUMN "last_name",
DROP COLUMN "mother_name",
DROP COLUMN "password",
DROP COLUMN "phone",
DROP COLUMN "recover_token",
DROP COLUMN "salt",
DROP COLUMN "social_name",
DROP COLUMN "status",
DROP COLUMN "username",
ADD COLUMN     "userContactInfoId" UUID NOT NULL,
ADD COLUMN     "userPersonalInfoId" UUID NOT NULL,
ADD COLUMN     "userSecurityInfoId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "users_personal_info" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(125) NOT NULL,
    "last_name" VARCHAR(125) NOT NULL,
    "social_name" VARCHAR(250),
    "born_date" VARCHAR(10) NOT NULL,
    "mother_name" VARCHAR(250) NOT NULL,
    "status" "UserStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_personal_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_contact_info" (
    "id" UUID NOT NULL,
    "username" VARCHAR(45),
    "email" VARCHAR(250) NOT NULL,
    "phone" VARCHAR(15),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_security_info" (
    "id" UUID NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "confirmation_token" VARCHAR(64),
    "recover_token" VARCHAR(64),
    "ip_address" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_security_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_contact_info_email_key" ON "users_contact_info"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_contact_info_phone_key" ON "users_contact_info"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_security_info_confirmation_token_key" ON "users_security_info"("confirmation_token");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_userPersonalInfoId_fkey" FOREIGN KEY ("userPersonalInfoId") REFERENCES "users_personal_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_userContactInfoId_fkey" FOREIGN KEY ("userContactInfoId") REFERENCES "users_contact_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_userSecurityInfoId_fkey" FOREIGN KEY ("userSecurityInfoId") REFERENCES "users_security_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
