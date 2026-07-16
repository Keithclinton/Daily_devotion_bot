import { Module } from "@nestjs/common";
import { DevotionsController } from "./devotions.controller";
import { DevotionsService } from "./devotions.service";

@Module({
  controllers: [DevotionsController],
  providers: [DevotionsService],
  exports: [DevotionsService],
})
export class DevotionsModule {}
