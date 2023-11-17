/*
  Warnings:

  - You are about to drop the column `ip_address` on the `users_security_info` table. All the data in the column will be lost.
  - Added the required column `origin_channel` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `users_contact_info` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `ip_address_origin` to the `users_security_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `on_update_ip_address` to the `users_security_info` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OriginChannel" AS ENUM ('WOPHI', 'LUMIN', 'MIAU');

-- CreateEnum
CREATE TYPE "AllowedPlatform" AS ENUM ('WOPHI', 'LUMIN', 'MIAU');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "allowed_platforms" "AllowedPlatform"[],
ADD COLUMN     "origin_channel" "OriginChannel" NOT NULL;

-- AlterTable
ALTER TABLE "users_contact_info" ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "users_security_info" DROP COLUMN "ip_address",
ADD COLUMN     "ip_address_origin" INET NOT NULL,
ADD COLUMN     "on_update_ip_address" INET NOT NULL;
