/*
  Warnings:

  - You are about to drop the column `decription` on the `Tasks` table. All the data in the column will be lost.
  - Added the required column `description` to the `Tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Tasks" DROP COLUMN "decription",
ADD COLUMN     "description" VARCHAR(5000) NOT NULL;
