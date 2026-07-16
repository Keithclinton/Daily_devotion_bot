-- CreateEnum
CREATE TYPE "SubscriberTier" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAST_DUE', 'CHURNED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('SUBSCRIPTION', 'BUNDLE', 'PER_DEVOTION');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "name" TEXT,
    "tier" "SubscriberTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriberStatus" NOT NULL DEFAULT 'PENDING',
    "subscriptionExpiry" TIMESTAMP(3),
    "onboardingState" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Devotion" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "verseText" TEXT NOT NULL,
    "verseReference" TEXT,
    "sermonText" TEXT NOT NULL,
    "songUrl" TEXT NOT NULL,
    "scheduledSendAt" TEXT NOT NULL,
    "isPremiumSermon" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Devotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "mpesaCheckoutId" TEXT,
    "mpesaReceiptNo" TEXT,
    "relatedDevotionId" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevotionUnlock" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "devotionId" TEXT NOT NULL,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DevotionUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryLog" (
    "id" TEXT NOT NULL,
    "devotionId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "contentTier" "SubscriberTier" NOT NULL,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_phoneNumber_key" ON "Subscriber"("phoneNumber");

-- CreateIndex
CREATE INDEX "Subscriber_status_idx" ON "Subscriber"("status");

-- CreateIndex
CREATE INDEX "Subscriber_tier_idx" ON "Subscriber"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "Devotion_date_key" ON "Devotion"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mpesaCheckoutId_key" ON "Payment"("mpesaCheckoutId");

-- CreateIndex
CREATE INDEX "Payment_subscriberId_idx" ON "Payment"("subscriberId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DevotionUnlock_subscriberId_devotionId_key" ON "DevotionUnlock"("subscriberId", "devotionId");

-- CreateIndex
CREATE INDEX "DeliveryLog_devotionId_idx" ON "DeliveryLog"("devotionId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryLog_devotionId_subscriberId_key" ON "DeliveryLog"("devotionId", "subscriberId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevotionUnlock" ADD CONSTRAINT "DevotionUnlock_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevotionUnlock" ADD CONSTRAINT "DevotionUnlock_devotionId_fkey" FOREIGN KEY ("devotionId") REFERENCES "Devotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryLog" ADD CONSTRAINT "DeliveryLog_devotionId_fkey" FOREIGN KEY ("devotionId") REFERENCES "Devotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryLog" ADD CONSTRAINT "DeliveryLog_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
