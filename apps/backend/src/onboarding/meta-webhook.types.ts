export interface MetaWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          from: string;
          text?: { body?: string };
          type?: string;
        }>;
      };
    }>;
  }>;
}

export interface InboundMessage {
  from: string;
  text: string;
}

/** Extracts the first inbound text message from a Meta Cloud API webhook payload, if any. */
export function extractInboundMessage(payload: MetaWebhookPayload): InboundMessage | null {
  const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message?.text?.body) {
    return null;
  }
  return { from: message.from, text: message.text.body };
}
