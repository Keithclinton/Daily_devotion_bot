import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { SubscribersService } from "./subscribers.service";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { subscriberUpdateSchema, SubscriberStatus, SubscriberTier, SubscriberUpdateInput } from "@devotion/shared";

@Controller("subscribers")
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @Get()
  findMany(@Query("status") status?: SubscriberStatus, @Query("tier") tier?: SubscriberTier) {
    return this.subscribersService.findMany(status, tier);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.subscribersService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(subscriberUpdateSchema)) body: SubscriberUpdateInput,
  ) {
    return this.subscribersService.update(id, body);
  }
}
