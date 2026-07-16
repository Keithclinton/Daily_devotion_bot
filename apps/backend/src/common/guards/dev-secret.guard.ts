import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class DevSecretGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.config.get<string>("NODE_ENV") === "production") {
      throw new ForbiddenException("Dev endpoints are disabled in production");
    }
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.header("x-dev-secret");
    if (!provided || provided !== this.config.get<string>("DEV_ENDPOINTS_SECRET")) {
      throw new ForbiddenException("Invalid dev secret");
    }
    return true;
  }
}
