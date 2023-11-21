/*
  Warnings:

  - You are about to drop the column `allowed_platforms` on the `users` table. All the data in the column will be lost.
  - Changed the type of `origin_channel` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('WOPHI', 'LUMIN', 'MIAU');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "allowed_platforms",
ADD COLUMN     "allowed_channels" "Channel"[],
DROP COLUMN "origin_channel",
ADD COLUMN     "origin_channel" "Channel" NOT NULL;

-- DropEnum
DROP TYPE "AllowedPlatform";

-- DropEnum
DROP TYPE "OriginChannel";
