import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "../common/decorators/public.decorator";
import { CurrentAdmin } from "./current-admin.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { loginInputSchema, LoginInput } from "@devotion/shared";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  login(@Body(new ZodValidationPipe(loginInputSchema)) body: LoginInput) {
    return this.authService.login(body);
  }

  @Get("me")
  me(@CurrentAdmin() admin: { id: string }) {
    return this.authService.me(admin.id);
  }
}
