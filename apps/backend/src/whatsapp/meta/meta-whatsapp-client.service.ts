import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SendMessageResult, WhatsappClient } from "../interfaces/whatsapp-client.interface";

const GRAPH_API_VERSION = "v25.0";

interface GraphSendResponse {
  messages?: { id: string }[];
  error?: { message: string };
}

/** Real Meta WhatsApp Cloud API client, used when WHATSAPP_PROVIDER=meta. */
@Injectable()
export class MetaWhatsappClient implements WhatsappClient {
  private readonly logger = new Logger(MetaWhatsappClient.name);

  constructor(private readonly config: ConfigService) {}

  async sendTextMessage(to: string, body: string): Promise<SendMessageResult> {
    return this.send(to, { type: "text", text: { body } });
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    bodyParams: string[],
    headerImageUrl?: string,
  ): Promise<SendMessageResult> {
    const components: Record<string, unknown>[] = [
      {
        type: "body",
        parameters: bodyParams.map((text) => ({ type: "text", text })),
      },
    ];
    if (headerImageUrl) {
      components.unshift({
        type: "header",
        parameters: [{ type: "image", image: { link: headerImageUrl } }],
      });
    }

    return this.send(to, {
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    });
  }

  private async send(to: string, messagePayload: Record<string, unknown>): Promise<SendMessageResult> {
    const accessToken = this.config.get<string>("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = this.config.get<string>("WHATSAPP_PHONE_NUMBER_ID");
    const baseUrl = this.config.get<string>("WHATSAPP_API_BASE_URL");

    const response = await fetch(
      `${baseUrl}/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/^\+/, ""),
          ...messagePayload,
        }),
      },
    );

    const payload = (await response.json()) as GraphSendResponse;

    if (!response.ok) {
      this.logger.error(`Meta send failed for ${to}: ${JSON.stringify(payload)}`);
      throw new InternalServerErrorException(
        `WhatsApp send failed: ${payload.error?.message ?? response.statusText}`,
      );
    }

    return { providerMessageId: payload.messages![0].id };
  }
}
