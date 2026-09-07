import { Inject, Injectable } from "@nestjs/common";
import { WHATSAPP_CLIENT, WhatsappClient } from "./interfaces/whatsapp-client.interface";

@Injectable()
export class WhatsappOutboundService {
  constructor(@Inject(WHATSAPP_CLIENT) private readonly client: WhatsappClient) {}

  sendTextMessage(to: string, body: string) {
    return this.client.sendTextMessage(to, body);
  }

  sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    bodyParams: string[],
    headerImageUrl?: string,
  ) {
    return this.client.sendTemplateMessage(to, templateName, languageCode, bodyParams, headerImageUrl);
  }
}
