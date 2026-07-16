import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { DispatchService, DispatchSummary } from "./dispatch.service";
import { nairobiDateString, nairobiTimeString } from "../common/nairobi-time";

export interface SchedulerStatus {
  lastRunAt: string | null;
  lastSummary: DispatchSummary | null;
}

@Injectable()
export class DispatchCronService {
  private readonly logger = new Logger(DispatchCronService.name);
  private lastRunAt: Date | null = null;
  private lastSummary: DispatchSummary | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatchService: DispatchService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick(): Promise<void> {
    const today = new Date(`${nairobiDateString()}T00:00:00.000Z`);
    const currentTime = nairobiTimeString();

    const devotion = await this.prisma.devotion.findUnique({ where: { date: today } });
    if (!devotion) {
      return;
    }
    if (devotion.scheduledSendAt > currentTime) {
      return; // not time yet today
    }

    this.lastRunAt = new Date();
    this.lastSummary = await this.dispatchService.dispatchDevotion(devotion.id);
  }

  getStatus(): SchedulerStatus {
    return {
      lastRunAt: this.lastRunAt ? this.lastRunAt.toISOString() : null,
      lastSummary: this.lastSummary,
    };
  }
}
