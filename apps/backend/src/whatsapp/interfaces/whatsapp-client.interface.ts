export interface SendMessageResult {
  providerMessageId: string;
}

export interface WhatsappClient {
  sendTextMessage(to: string, body: string): Promise<SendMessageResult>;
}

export const WHATSAPP_CLIENT = Symbol("WHATSAPP_CLIENT");
