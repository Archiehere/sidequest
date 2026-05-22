import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrdersService } from './orders.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

class OverrideItemDto {
  @IsString() instamartProductId!: string;
  @IsInt() qty!: number;
}

class CheckoutDto {
  @IsString() questId!: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => OverrideItemDto)
  materials?: OverrideItemDto[];
}

@UseGuards(AuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post('checkout')
  checkout(@Body() body: CheckoutDto, @CurrentUser() user: { id: string }) {
    return this.orders.checkout(user.id, body.questId, body.materials);
  }

  @Get('mine')
  mine(@CurrentUser() user: { id: string }) {
    return this.orders.listMine(user.id);
  }
}
