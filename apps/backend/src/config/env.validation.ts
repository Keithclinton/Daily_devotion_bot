import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default("12h"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(1),
  DEV_ENDPOINTS_SECRET: z.string().min(1),

  WHATSAPP_PROVIDER: z.enum(["mock", "meta"]).default("mock"),
  WHATSAPP_ACCESS_TOKEN: z.string().optional().default(""),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional().default(""),
  WHATSAPP_VERIFY_TOKEN: z.string().optional().default(""),

  MPESA_PROVIDER: z.enum(["mock", "daraja"]).default("mock"),
  MPESA_CONSUMER_KEY: z.string().optional().default(""),
  MPESA_CONSUMER_SECRET: z.string().optional().default(""),
  MPESA_SHORTCODE: z.string().optional().default(""),
  MPESA_PASSKEY: z.string().optional().default(""),
  MPESA_CALLBACK_BASE_URL: z.string().default("http://localhost:3000"),

  SUBSCRIPTION_PRICE_KES: z.coerce.number().default(200),
  BUNDLE_PRICE_KES: z.coerce.number().default(500),
  BUNDLE_DAYS: z.coerce.number().default(30),
  PER_DEVOTION_PRICE_KES: z.coerce.number().default(20),

  TZ: z.string().default("Africa/Nairobi"),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment configuration: ${result.error.toString()}`);
  }
  return result.data;
}
