import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { WHATSAPP_CLIENT } from "./interfaces/whatsapp-client.interface";
import { MockWhatsappClient } from "./mock/mock-whatsapp-client.service";
import { MetaWhatsappClient } from "./meta/meta-whatsapp-client.service";
import { WhatsappOutboundService } from "./whatsapp-outbound.service";

@Module({
  imports: [ConfigModule],
  providers: [
    MockWhatsappClient,
    MetaWhatsappClient,
    {
      provide: WHATSAPP_CLIENT,
      inject: [ConfigService, MockWhatsappClient, MetaWhatsappClient],
      useFactory: (config: ConfigService, mock: MockWhatsappClient, meta: MetaWhatsappClient) =>
        config.get<string>("WHATSAPP_PROVIDER") === "meta" ? meta : mock,
    },
    WhatsappOutboundService,
  ],
  exports: [WhatsappOutboundService],
})
export class WhatsappModule {}
