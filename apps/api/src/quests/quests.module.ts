import { Module } from '@nestjs/common';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';
import { InstamartModule } from '../instamart/instamart.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [InstamartModule, AuthModule],
  controllers: [QuestsController],
  providers: [QuestsService],
})
export class QuestsModule {}
