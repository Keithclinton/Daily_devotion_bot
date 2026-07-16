import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DevotionBatchInput, DevotionInput, DevotionUpdateInput } from "@devotion/shared";
import { parseDateOnly, toDevotionDto } from "./devotions.mapper";

@Injectable()
export class DevotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: DevotionInput) {
    const existing = await this.prisma.devotion.findUnique({
      where: { date: parseDateOnly(input.date) },
    });
    if (existing) {
      throw new ConflictException(`A devotion already exists for ${input.date}`);
    }
    const devotion = await this.prisma.devotion.create({
      data: {
        date: parseDateOnly(input.date),
        verseText: input.verseText,
        verseReference: input.verseReference,
        sermonText: input.sermonText,
        songUrl: input.songUrl,
        scheduledSendAt: input.scheduledSendAt,
        isPremiumSermon: input.isPremiumSermon,
      },
    });
    return toDevotionDto(devotion);
  }

  async createBatch(inputs: DevotionBatchInput) {
    const results = await this.prisma.$transaction(
      inputs.map((input) =>
        this.prisma.devotion.upsert({
          where: { date: parseDateOnly(input.date) },
          create: {
            date: parseDateOnly(input.date),
            verseText: input.verseText,
            verseReference: input.verseReference,
            sermonText: input.sermonText,
            songUrl: input.songUrl,
            scheduledSendAt: input.scheduledSendAt,
            isPremiumSermon: input.isPremiumSermon,
          },
          update: {
            verseText: input.verseText,
            verseReference: input.verseReference,
            sermonText: input.sermonText,
            songUrl: input.songUrl,
            scheduledSendAt: input.scheduledSendAt,
            isPremiumSermon: input.isPremiumSermon,
          },
        }),
      ),
    );
    return results.map(toDevotionDto);
  }

  async findMany(from?: string, to?: string) {
    const devotions = await this.prisma.devotion.findMany({
      where: {
        date: {
          gte: from ? parseDateOnly(from) : undefined,
          lte: to ? parseDateOnly(to) : undefined,
        },
      },
      orderBy: { date: "asc" },
    });
    return devotions.map(toDevotionDto);
  }

  async findOne(id: string) {
    const devotion = await this.prisma.devotion.findUnique({ where: { id } });
    if (!devotion) {
      throw new NotFoundException("Devotion not found");
    }
    return toDevotionDto(devotion);
  }

  async update(id: string, input: DevotionUpdateInput) {
    await this.findOne(id);
    const devotion = await this.prisma.devotion.update({
      where: { id },
      data: {
        ...input,
        date: input.date ? parseDateOnly(input.date) : undefined,
      },
    });
    return toDevotionDto(devotion);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.devotion.delete({ where: { id } });
    return { success: true };
  }
}
