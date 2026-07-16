import { z } from "zod";

export const mockInboundMessageSchema = z.object({
  from: z.string().min(5),
  text: z.string().min(1),
});
export type MockInboundMessageInput = z.infer<typeof mockInboundMessageSchema>;
