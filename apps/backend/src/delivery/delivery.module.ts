import { Module } from "@nestjs/common";
import { DeliveryService } from "./delivery.service";
import { SubscribersModule } from "../subscribers/subscribers.module";
import { WhatsappModule } from "../whatsapp/whatsapp.module";

@Module({
  imports: [SubscribersModule, WhatsappModule],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
