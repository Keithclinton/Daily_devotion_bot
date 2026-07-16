import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import { SendMessageResult, WhatsappClient } from "../interfaces/whatsapp-client.interface";

@Injectable()
export class MockWhatsappClient implements WhatsappClient {
  private readonly logger = new Logger("MockWhatsappClient");

  async sendTextMessage(to: string, body: string): Promise<SendMessageResult> {
    const providerMessageId = `mock-${randomUUID()}`;
    this.logger.log(`[WHATSAPP -> ${to}] ${body} (id=${providerMessageId})`);
    return { providerMessageId };
  }
}
