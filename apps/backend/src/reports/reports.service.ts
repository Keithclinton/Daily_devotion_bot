import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentStatus } from "@devotion/shared";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenue(from?: string, to?: string) {
    const where = {
      status: PaymentStatus.COMPLETED,
      createdAt: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
    };

    const [byType, payments] = await Promise.all([
      this.prisma.payment.groupBy({
        by: ["type"],
        where,
        _sum: { amount: true },
        _count: { _all: true },
      }),
      this.prisma.payment.findMany({ where, select: { amount: true, createdAt: true } }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    const byDay = new Map<string, number>();
    for (const payment of payments) {
      const day = payment.createdAt.toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + Number(payment.amount));
    }

    return {
      totalRevenue,
      byType: byType.map((row) => ({
        type: row.type,
        total: Number(row._sum.amount ?? 0),
        count: row._count._all,
      })),
      byDay: Array.from(byDay.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, total]) => ({ day, total })),
    };
  }

  async getSubscribersSummary() {
    const [byTier, byStatus, total] = await Promise.all([
      this.prisma.subscriber.groupBy({ by: ["tier"], _count: { _all: true } }),
      this.prisma.subscriber.groupBy({ by: ["status"], _count: { _all: true } }),
      this.prisma.subscriber.count(),
    ]);

    return {
      total,
      byTier: byTier.map((row) => ({ tier: row.tier, count: row._count._all })),
      byStatus: byStatus.map((row) => ({ status: row.status, count: row._count._all })),
    };
  }

  async getDeliveryBreakdown(devotionId?: string) {
    const rows = await this.prisma.deliveryLog.groupBy({
      by: ["status"],
      where: devotionId ? { devotionId } : undefined,
      _count: { _all: true },
    });
    return rows.map((row) => ({ status: row.status, count: row._count._all }));
  }
}
