import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { existsSync } from "fs";
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
    // Resolve frontend dist path at runtime. Try a few common locations so
    // serving works both when running from monorepo root and from the
    // compiled package directory in production.
    (() => {
      const candidates = [
        join(process.cwd(), "apps", "frontend", "dist"),
        join(process.cwd(), "..", "frontend", "dist"),
        join(__dirname, "..", "..", "frontend", "dist"),
      ];
      const rootPath = candidates.find((p) => existsSync(p)) ?? candidates[0];
      return ServeStaticModule.forRoot({ rootPath, serveRoot: "/admin" });
    })(),
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
