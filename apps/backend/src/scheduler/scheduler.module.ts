import { Module } from "@nestjs/common";
import { DispatchService } from "./dispatch.service";
import { DispatchCronService } from "./dispatch-cron.service";
import { SchedulerController } from "./scheduler.controller";
import { DeliveryModule } from "../delivery/delivery.module";

@Module({
  imports: [DeliveryModule],
  controllers: [SchedulerController],
  providers: [DispatchService, DispatchCronService],
})
export class SchedulerModule {}
