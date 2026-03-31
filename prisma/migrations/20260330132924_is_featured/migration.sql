-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "transactionId" SET DATA TYPE TEXT;
