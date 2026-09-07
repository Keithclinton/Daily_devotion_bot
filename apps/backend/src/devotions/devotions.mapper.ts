import { Devotion } from "@prisma/client";
import { DevotionDto } from "@devotion/shared";

export function toDevotionDto(devotion: Devotion): DevotionDto {
  return {
    id: devotion.id,
    date: devotion.date.toISOString().slice(0, 10),
    verseText: devotion.verseText,
    verseReference: devotion.verseReference,
    sermonText: devotion.sermonText,
    songUrl: devotion.songUrl,
    imageUrl: devotion.imageUrl,
    scheduledSendAt: devotion.scheduledSendAt,
    isPremiumSermon: devotion.isPremiumSermon,
    createdAt: devotion.createdAt.toISOString(),
    updatedAt: devotion.updatedAt.toISOString(),
  };
}

export function parseDateOnly(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}
