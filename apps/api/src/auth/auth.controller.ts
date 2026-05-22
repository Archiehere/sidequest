import { Body, Controller, Post } from '@nestjs/common';
import { IsOptional, IsString, Length } from 'class-validator';
import { AuthService } from './auth.service';

class RequestOtpDto {
  @IsString() @Length(10, 15) phone!: string;
}

class VerifyOtpDto {
  @IsString() @Length(10, 15) phone!: string;
  @IsString() @Length(4, 6) otp!: string;
  @IsOptional() @IsString() handle?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('otp/request')
  request(@Body() body: RequestOtpDto) {
    return this.auth.requestOtp(body.phone);
  }

  @Post('otp/verify')
  verify(@Body() body: VerifyOtpDto) {
    return this.auth.verifyOtp(body.phone, body.otp, body.handle);
  }
}
