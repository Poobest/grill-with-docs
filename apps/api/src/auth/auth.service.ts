import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './jwt.strategy';

export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    name: string;
    role: string;
    tenantId: string;
    branchId: string | null;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Authenticates a tenant user by email + password and issues a tenant JWT.
   *
   * v1 note: email is unique per tenant, not globally. With a single onboarded
   * tenant this is unambiguous; multi-tenant login disambiguation (tenant slug)
   * is tracked as a follow-up.
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.prisma.user.findFirst({
      where: { email, isActive: true },
    });

    const passwordOk =
      user !== null && (await bcrypt.compare(password, user.password));
    if (!user || !passwordOk) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      branchId: user.branchId,
    };

    return {
      accessToken: await this.jwt.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        branchId: user.branchId,
      },
    };
  }
}
