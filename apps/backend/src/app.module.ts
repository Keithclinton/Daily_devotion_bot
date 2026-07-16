import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { validate } from "./config/env.validation";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { DevotionsModule } from "./devotions/devotions.module";
import { SubscribersModule } from "./subscribers/subscribers.module";
import { WhatsappModule } from "./whatsapp/whatsapp.module";
import { DeliveryModule } from "./delivery/delivery.module";
import { PaymentsModule } from "./payments/payments.module";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { SchedulerModule } from "./scheduler/scheduler.module";
import { ReportsModule } from "./reports/reports.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    DevotionsModule,
    SubscribersModule,
    WhatsappModule,
    DeliveryModule,
    PaymentsModule,
    OnboardingModule,
    SchedulerModule,
    ReportsModule,
  ],
})
export class AppModule {}
