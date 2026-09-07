import "reflect-metadata";

// Kenya has no DST, so pinning the process TZ here (before any Date is used)
// is enough to make native Date local getters reflect Nairobi wall-clock time.
process.env.TZ = process.env.TZ || "Africa/Nairobi";

import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: { origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" },
    rawBody: true,
  });
  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads" });
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  console.log(`Backend listening on port ${port}`);
}

bootstrap();
