import { Controller, Get, Param, Post } from "@nestjs/common";
import { DispatchService } from "./dispatch.service";
import { DispatchCronService } from "./dispatch-cron.service";

@Controller("scheduler")
export class SchedulerController {
  constructor(
    private readonly dispatchService: DispatchService,
    private readonly cronService: DispatchCronService,
  ) {}

  @Post("dispatch/:devotionId")
  dispatch(@Param("devotionId") devotionId: string) {
    return this.dispatchService.dispatchDevotion(devotionId);
  }

  @Get("status")
  status() {
    return this.cronService.getStatus();
  }
}
