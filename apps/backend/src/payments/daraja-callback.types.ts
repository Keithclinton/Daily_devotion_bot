export interface DarajaCallbackItem {
  Name: string;
  Value?: string | number;
}

export interface DarajaStkCallbackPayload {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: DarajaCallbackItem[];
      };
    };
  };
}

export function extractMpesaReceipt(payload: DarajaStkCallbackPayload): string | undefined {
  const item = payload.Body.stkCallback.CallbackMetadata?.Item.find(
    (i) => i.Name === "MpesaReceiptNumber",
  );
  return item?.Value ? String(item.Value) : undefined;
}
