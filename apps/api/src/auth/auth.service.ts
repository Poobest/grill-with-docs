import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async loginTenant(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, isActive: true },
      include: { tenant: { select: { isActive: true } } },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      branchId: user.branchId,
    };

    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async loginPlatform(email: string, password: string) {
    const admin = await this.prisma.platformAdmin.findUnique({
      where: { email },
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin.id, role: 'PLATFORM_ADMIN' };
    return {
      accessToken: this.jwt.sign(payload, {
        secret: process.env.JWT_PLATFORM_SECRET,
      }),
      admin: { id: admin.id, email: admin.email },
    };
  }

  async setupPlatformAdmin(email: string, password: string) {
    const exists = await this.prisma.platformAdmin.count();
    if (exists > 0) {
      throw new ConflictException('Platform admin already exists');
    }
    const hashed = await this.hashPassword(password);
    const admin = await this.prisma.platformAdmin.create({
      data: { email, password: hashed },
      select: { id: true, email: true, createdAt: true },
    });
    return admin;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
