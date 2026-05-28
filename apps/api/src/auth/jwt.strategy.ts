import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithoutRequest } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  tenantId?: string;
  role: string;
  branchId?: string;
}

const tenantOptions: StrategyOptionsWithoutRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET ?? 'fallback-secret',
};

const platformOptions: StrategyOptionsWithoutRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_PLATFORM_SECRET ?? 'platform-fallback-secret',
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super(tenantOptions);
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
      branchId: payload.branchId,
    };
  }
}

@Injectable()
export class PlatformJwtStrategy extends PassportStrategy(Strategy, 'platform-jwt') {
  constructor() {
    super(platformOptions);
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub, role: payload.role };
  }
}
