import { z } from "zod";

const timeOfDay = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "scheduledSendAt must be HH:mm (24h)");

export const devotionInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  verseText: z.string().min(1),
  verseReference: z.string().optional(),
  sermonText: z.string().min(1),
  songUrl: z.string().url(),
  imageUrl: z.string().url().optional(),
  scheduledSendAt: timeOfDay,
  isPremiumSermon: z.boolean().default(true),
});
export type DevotionInput = z.infer<typeof devotionInputSchema>;

export const devotionBatchInputSchema = z.array(devotionInputSchema).min(1);
export type DevotionBatchInput = z.infer<typeof devotionBatchInputSchema>;

export const devotionUpdateSchema = devotionInputSchema.partial();
export type DevotionUpdateInput = z.infer<typeof devotionUpdateSchema>;

export interface DevotionDto {
  id: string;
  date: string;
  verseText: string;
  verseReference: string | null;
  sermonText: string;
  songUrl: string;
  imageUrl: string | null;
  scheduledSendAt: string;
  isPremiumSermon: boolean;
  createdAt: string;
  updatedAt: string;
}
