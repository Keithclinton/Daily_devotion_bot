import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { PrismaService } from "../prisma/prisma.service";
import { DevotionBatchInput, DevotionInput, DevotionUpdateInput } from "@devotion/shared";
import { parseDateOnly, toDevotionDto } from "./devotions.mapper";

const UPLOAD_DIR = join(process.cwd(), "uploads");
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

@Injectable()
export class DevotionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async saveUploadedImage(file: Express.Multer.File): Promise<{ url: string }> {
    const extension = ALLOWED_IMAGE_TYPES[file.mimetype];
    if (!extension) {
      throw new BadRequestException("Only JPEG, PNG, or WebP images are allowed");
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${randomUUID()}.${extension}`;
    await writeFile(join(UPLOAD_DIR, filename), file.buffer);

    const baseUrl = this.config.get<string>("PUBLIC_BASE_URL");
    return { url: `${baseUrl}/uploads/${filename}` };
  }

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
        imageUrl: input.imageUrl,
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
            imageUrl: input.imageUrl,
            scheduledSendAt: input.scheduledSendAt,
            isPremiumSermon: input.isPremiumSermon,
          },
          update: {
            verseText: input.verseText,
            verseReference: input.verseReference,
            sermonText: input.sermonText,
            songUrl: input.songUrl,
            imageUrl: input.imageUrl,
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
