import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "crypto";
import { Request } from "express";

/**
 * Verifies Meta's X-Hub-Signature-256 header against the raw request body.
 * If WHATSAPP_APP_SECRET isn't configured yet, verification is skipped (with
 * a warning) rather than blocking — lets a deployment come up before the app
 * secret is wired in, but any deployment that sets it gets real protection.
 */
@Injectable()
export class MetaSignatureGuard implements CanActivate {
  private readonly logger = new Logger(MetaSignatureGuard.name);

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const appSecret = this.config.get<string>("WHATSAPP_APP_SECRET");
    if (!appSecret) {
      this.logger.warn("WHATSAPP_APP_SECRET not set — skipping webhook signature verification");
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const signatureHeader = request.header("x-hub-signature-256");
    const rawBody = (request as Request & { rawBody?: Buffer }).rawBody;

    if (!signatureHeader || !rawBody) {
      throw new ForbiddenException("Missing webhook signature");
    }

    const expected = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
    const expectedBuffer = Buffer.from(expected);
    const providedBuffer = Buffer.from(signatureHeader);

    if (
      expectedBuffer.length !== providedBuffer.length ||
      !timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      throw new ForbiddenException("Invalid webhook signature");
    }

    return true;
  }
}
