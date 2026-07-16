import "reflect-metadata";

// Kenya has no DST, so pinning the process TZ here (before any Date is used)
// is enough to make native Date local getters reflect Nairobi wall-clock time.
process.env.TZ = process.env.TZ || "Africa/Nairobi";

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  console.log(`Backend listening on port ${port}`);
}

bootstrap();
