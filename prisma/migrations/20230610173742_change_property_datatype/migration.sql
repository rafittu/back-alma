/*
  Warnings:

  - You are about to drop the column `userContactInfoId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `userPersonalInfoId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `userSecurityInfoId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users_personal_info` table. All the data in the column will be lost.
  - Added the required column `user_contact_info_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_personal_info_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_security_info_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `users_security_info` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `ip_address` on the `users_security_info` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_userContactInfoId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_userPersonalInfoId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_userSecurityInfoId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "userContactInfoId",
DROP COLUMN "userPersonalInfoId",
DROP COLUMN "userSecurityInfoId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_contact_info_id" UUID NOT NULL,
ADD COLUMN     "user_personal_info_id" UUID NOT NULL,
ADD COLUMN     "user_security_info_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "users_personal_info" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "users_security_info" ADD COLUMN     "status" "UserStatus" NOT NULL,
DROP COLUMN "ip_address",
ADD COLUMN     "ip_address" INET NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_personal_info_id_fkey" FOREIGN KEY ("user_personal_info_id") REFERENCES "users_personal_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_contact_info_id_fkey" FOREIGN KEY ("user_contact_info_id") REFERENCES "users_contact_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_security_info_id_fkey" FOREIGN KEY ("user_security_info_id") REFERENCES "users_security_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
