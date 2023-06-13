-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING_CONFIRMATION', 'ACTIVE', 'BLOCKED', 'CANCELLED', 'BANNED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(125) NOT NULL,
    "last_name" VARCHAR(125) NOT NULL,
    "social_name" VARCHAR(250) NOT NULL,
    "born_date" VARCHAR(10) NOT NULL,
    "mother_name" VARCHAR(250) NOT NULL,
    "status" "UserStatus" NOT NULL,
    "username" VARCHAR(45),
    "email" VARCHAR(250) NOT NULL,
    "phone" VARCHAR(15),
    "password" TEXT NOT NULL,
    "ip_address" INTEGER NOT NULL,
    "salt" TEXT NOT NULL,
    "confirmation_token" VARCHAR(64),
    "recover_token" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_confirmation_token_key" ON "users"("confirmation_token");
