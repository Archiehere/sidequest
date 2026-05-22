import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('quests')
export class QuestsController {
  constructor(private quests: QuestsService) {}

  @Get('today')
  today() {
    return this.quests.todaysDrop();
  }

  @Get(':id')
  one(@Param('id') id: string) {
    return this.quests.getQuest(id);
  }

  @UseGuards(AuthGuard)
  @Post(':id/like')
  like(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.quests.like(user.id, id);
  }
}
