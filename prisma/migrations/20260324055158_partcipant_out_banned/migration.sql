/*
  Warnings:

  - The values [BANNED] on the enum `ParticipantStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ParticipantStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."Participant" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Participant" ALTER COLUMN "status" TYPE "ParticipantStatus_new" USING ("status"::text::"ParticipantStatus_new");
ALTER TYPE "ParticipantStatus" RENAME TO "ParticipantStatus_old";
ALTER TYPE "ParticipantStatus_new" RENAME TO "ParticipantStatus";
DROP TYPE "public"."ParticipantStatus_old";
ALTER TABLE "Participant" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
