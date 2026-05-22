import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Demo-grade auth. Replace with real OTP + JWT (MSG91 / Firebase Phone Auth)
 * before any non-test traffic. The token here is just `tok_<userId>` so the
 * mobile app can pretend to be authenticated end-to-end.
 */
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async requestOtp(phone: string): Promise<{ devOtp: string }> {
    // In real impl: store OTP in Redis with short TTL, send via MSG91.
    return { devOtp: '123456' };
  }

  async verifyOtp(phone: string, otp: string, handle?: string) {
    if (otp !== '123456') throw new UnauthorizedException('Invalid OTP');
    const fallbackHandle = handle ?? `user_${phone.slice(-4)}`;
    const user = await this.prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone, handle: fallbackHandle },
    });
    return { token: `tok_${user.id}`, user };
  }

  async userFromToken(token: string | undefined) {
    if (!token?.startsWith('tok_')) return null;
    const userId = token.slice(4);
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
