import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginInput, LoginResponseDto } from "@devotion/shared";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(input: LoginInput): Promise<LoginResponseDto> {
    const admin = await this.prisma.adminUser.findUnique({ where: { email: input.email } });
    if (!admin) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const passwordMatches = await bcrypt.compare(input.password, admin.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const accessToken = await this.jwt.signAsync({ sub: admin.id, email: admin.email });
    return { accessToken, admin: { id: admin.id, email: admin.email } };
  }

  async me(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw new UnauthorizedException();
    }
    return { id: admin.id, email: admin.email };
  }
}
