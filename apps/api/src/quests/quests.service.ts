import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { INSTAMART_CLIENT, InstamartClient } from '../instamart/instamart.client';

function startOfTodayUTC(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

@Injectable()
export class QuestsService {
  constructor(
    private prisma: PrismaService,
    @Inject(INSTAMART_CLIENT) private instamart: InstamartClient,
  ) {}

  async todaysDrop() {
    const today = startOfTodayUTC();
    const quests = await this.prisma.quest.findMany({
      where: { dropDate: today, status: 'live' },
      orderBy: { createdAt: 'asc' },
      include: { materials: true, _count: { select: { likes: true } } },
    });
    // Fallback for demo convenience: if no quest is set for today, show the
    // latest LIVE batch so the app isn't empty.
    if (quests.length === 0) {
      const latest = await this.prisma.quest.findFirst({
        where: { status: 'live' },
        orderBy: { dropDate: 'desc' },
        select: { dropDate: true },
      });
      if (latest) {
        return this.prisma.quest.findMany({
          where: { dropDate: latest.dropDate, status: 'live' },
          orderBy: { createdAt: 'asc' },
          include: { materials: true, _count: { select: { likes: true } } },
        });
      }
    }
    return quests;
  }

  async getQuest(id: string) {
    const quest = await this.prisma.quest.findUnique({
      where: { id },
      include: { materials: true, _count: { select: { likes: true } } },
    });
    if (!quest) throw new NotFoundException('Quest not found');

    // Enrich materials with live prices from the (mock) Instamart catalog.
    const materialsWithPricing = await Promise.all(
      quest.materials.map(async (m) => {
        const product = await this.instamart.getProduct(m.instamartProductId);
        return {
          ...m,
          product,
        };
      }),
    );

    const subtotalPaise = materialsWithPricing.reduce(
      (s, m) => s + (m.product?.pricePaise ?? 0) * m.qty,
      0,
    );

    return { ...quest, materials: materialsWithPricing, subtotalPaise };
  }

  async like(userId: string, questId: string) {
    await this.prisma.questLike.upsert({
      where: { userId_questId: { userId, questId } },
      update: {},
      create: { userId, questId },
    });
    const count = await this.prisma.questLike.count({ where: { questId } });
    return { liked: true, likeCount: count };
  }
}
