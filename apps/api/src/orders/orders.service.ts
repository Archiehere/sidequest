import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { INSTAMART_CLIENT, InstamartClient } from '../instamart/instamart.client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @Inject(INSTAMART_CLIENT) private instamart: InstamartClient,
  ) {}

  async checkout(userId: string, questId: string, materialOverrides?: Array<{ instamartProductId: string; qty: number }>) {
    const quest = await this.prisma.quest.findUnique({
      where: { id: questId },
      include: { materials: true },
    });
    if (!quest) throw new NotFoundException('Quest not found');

    const itemsRaw = materialOverrides?.length
      ? materialOverrides.map((m) => ({ productId: m.instamartProductId, qty: m.qty }))
      : quest.materials.filter((m) => !m.optional).map((m) => ({ productId: m.instamartProductId, qty: m.qty }));

    const basket = await this.instamart.createBasket(itemsRaw);
    const checkout = await this.instamart.initiateCheckout(basket.id, userId);

    const order = await this.prisma.order.create({
      data: {
        userId,
        questId,
        instamartOrderRef: checkout.orderRef,
        totalAmount: basket.totalPaise,
        affiliateAttributionId: checkout.affiliateAttributionId,
        status: 'pending',
      },
    });

    return {
      order,
      basket,
      checkoutUrl: checkout.checkoutUrl,
    };
  }

  async listMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { quest: { select: { id: true, title: true, heroImageUrl: true } } },
    });
  }
}
