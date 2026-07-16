import { Injectable, NotImplementedException } from "@nestjs/common";
import { SendMessageResult, WhatsappClient } from "../interfaces/whatsapp-client.interface";

/**
 * Real Meta WhatsApp Cloud API client. Swap in once WHATSAPP_ACCESS_TOKEN and
 * WHATSAPP_PHONE_NUMBER_ID are available and WHATSAPP_PROVIDER=meta is set.
 */
@Injectable()
export class MetaWhatsappClient implements WhatsappClient {
  async sendTextMessage(_to: string, _body: string): Promise<SendMessageResult> {
    throw new NotImplementedException(
      "MetaWhatsappClient is not implemented yet. Set WHATSAPP_PROVIDER=mock until real credentials are wired up.",
    );
  }
}
