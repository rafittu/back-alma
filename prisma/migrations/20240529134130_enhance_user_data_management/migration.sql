/*
  Warnings:

  - You are about to drop the column `user_contact_info_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `user_personal_info_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `user_security_info_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `users_contact_info` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_personal_info` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_security_info` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_personal_data_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_contact_data_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_security_data_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_contact_data_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_personal_data_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_security_data_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_user_contact_info_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_user_personal_info_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_user_security_info_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "user_contact_info_id",
DROP COLUMN "user_personal_info_id",
DROP COLUMN "user_security_info_id",
ADD COLUMN     "user_contact_data_id" UUID NOT NULL,
ADD COLUMN     "user_personal_data_id" UUID NOT NULL,
ADD COLUMN     "user_security_data_id" UUID NOT NULL;

-- DropTable
DROP TABLE "users_contact_info";

-- DropTable
DROP TABLE "users_personal_info";

-- DropTable
DROP TABLE "users_security_info";

-- CreateTable
CREATE TABLE "users_personal_data" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(125) NOT NULL,
    "last_name" VARCHAR(125) NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "social_name" VARCHAR(250),
    "born_date" TIMESTAMP(3) NOT NULL,
    "mother_name" VARCHAR(250) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_personal_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_contact_data" (
    "id" UUID NOT NULL,
    "username" VARCHAR(45),
    "email" VARCHAR(250) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_contact_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_security_data" (
    "id" UUID NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "confirmation_token" VARCHAR(64),
    "recover_token" VARCHAR(64),
    "token_expires_at" TIMESTAMP(3),
    "ip_address_origin" INET NOT NULL,
    "on_update_ip_address" INET,
    "status" "UserStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_security_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_personal_data_id_key" ON "users_personal_data"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_contact_data_id_key" ON "users_contact_data"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_contact_data_email_key" ON "users_contact_data"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_contact_data_phone_key" ON "users_contact_data"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_security_data_id_key" ON "users_security_data"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_security_data_confirmation_token_key" ON "users_security_data"("confirmation_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_security_data_recover_token_key" ON "users_security_data"("recover_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_personal_data_id_key" ON "users"("user_personal_data_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_contact_data_id_key" ON "users"("user_contact_data_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_security_data_id_key" ON "users"("user_security_data_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_personal_data_id_fkey" FOREIGN KEY ("user_personal_data_id") REFERENCES "users_personal_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_contact_data_id_fkey" FOREIGN KEY ("user_contact_data_id") REFERENCES "users_contact_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_security_data_id_fkey" FOREIGN KEY ("user_security_data_id") REFERENCES "users_security_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;
