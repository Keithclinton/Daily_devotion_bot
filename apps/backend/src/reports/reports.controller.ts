import { Controller, Get, Query } from "@nestjs/common";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("revenue")
  revenue(@Query("from") from?: string, @Query("to") to?: string) {
    return this.reportsService.getRevenue(from, to);
  }

  @Get("subscribers/summary")
  subscribersSummary() {
    return this.reportsService.getSubscribersSummary();
  }

  @Get("deliveries")
  deliveries(@Query("devotionId") devotionId?: string) {
    return this.reportsService.getDeliveryBreakdown(devotionId);
  }
}
