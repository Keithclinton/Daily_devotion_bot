import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MPESA_CLIENT } from "./interfaces/mpesa-client.interface";
import { MockMpesaClient } from "./mock/mock-mpesa-client.service";
import { DarajaMpesaClient } from "./daraja/daraja-mpesa-client.service";
import { PaymentsService } from "./payments.service";
import { PaymentsWebhookController } from "./payments-webhook.controller";
import { MockPayController } from "./mock-pay.controller";
import { DeliveryModule } from "../delivery/delivery.module";
import { WhatsappModule } from "../whatsapp/whatsapp.module";

@Module({
  imports: [ConfigModule, DeliveryModule, WhatsappModule],
  controllers: [PaymentsWebhookController, MockPayController],
  providers: [
    MockMpesaClient,
    DarajaMpesaClient,
    {
      provide: MPESA_CLIENT,
      inject: [ConfigService, MockMpesaClient, DarajaMpesaClient],
      useFactory: (config: ConfigService, mock: MockMpesaClient, daraja: DarajaMpesaClient) =>
        config.get<string>("MPESA_PROVIDER") === "daraja" ? daraja : mock,
    },
    PaymentsService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
