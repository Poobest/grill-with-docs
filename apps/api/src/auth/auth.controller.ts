import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}

class SetupAdminDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.loginTenant(dto.email, dto.password);
  }

  @Post('platform/login')
  platformLogin(@Body() dto: LoginDto) {
    return this.authService.loginPlatform(dto.email, dto.password);
  }

  @Post('platform/setup')
  setupPlatformAdmin(@Body() dto: SetupAdminDto) {
    return this.authService.setupPlatformAdmin(dto.email, dto.password);
  }
}
