/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeEventId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paymentGatewayData" JSONB,
ADD COLUMN     "stripeEventId" TEXT,
ADD COLUMN     "transactionId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeEventId_key" ON "Payment"("stripeEventId");
