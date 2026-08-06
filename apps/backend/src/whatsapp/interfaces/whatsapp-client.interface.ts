export interface SendMessageResult {
  providerMessageId: string;
}

export interface WhatsappClient {
  sendTextMessage(to: string, body: string): Promise<SendMessageResult>;
  sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    bodyParams: string[],
  ): Promise<SendMessageResult>;
}

export const WHATSAPP_CLIENT = Symbol("WHATSAPP_CLIENT");
