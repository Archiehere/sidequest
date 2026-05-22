import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { InstamartModule } from '../instamart/instamart.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [InstamartModule, AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
