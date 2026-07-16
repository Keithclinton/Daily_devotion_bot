import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import pLimit from "p-limit";
import { PrismaService } from "../prisma/prisma.service";
import { DeliveryService } from "../delivery/delivery.service";
import { SubscriberStatus } from "@devotion/shared";

export interface DispatchSummary {
  devotionId: string;
  sent: number;
  failed: number;
  alreadyProcessed: number;
}

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly delivery: DeliveryService,
  ) {}

  async dispatchDevotion(devotionId: string): Promise<DispatchSummary> {
    const devotion = await this.prisma.devotion.findUnique({ where: { id: devotionId } });
    if (!devotion) {
      throw new NotFoundException("Devotion not found");
    }

    const subscribers = await this.prisma.subscriber.findMany({
      where: { status: SubscriberStatus.ACTIVE },
    });

    const limit = pLimit(20);
    const results = await Promise.allSettled(
      subscribers.map((subscriber) =>
        limit(() => this.delivery.deliverToSubscriber(devotion, subscriber)),
      ),
    );

    const summary: DispatchSummary = { devotionId, sent: 0, failed: 0, alreadyProcessed: 0 };
    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value === "SENT") summary.sent += 1;
        else if (result.value === "FAILED") summary.failed += 1;
        else summary.alreadyProcessed += 1;
      } else {
        summary.failed += 1;
      }
    }

    this.logger.log(`Dispatch summary for devotion ${devotionId}: ${JSON.stringify(summary)}`);
    return summary;
  }
}
