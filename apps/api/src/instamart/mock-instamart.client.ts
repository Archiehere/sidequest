import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InstamartClient } from './instamart.client';
import { InstamartBasket, InstamartCheckoutResult, InstamartProduct } from './instamart.types';

/**
 * Stand-in for the Swiggy Instamart MCP client.
 * The real MCP at https://mcp.swiggy.com/im requires partner auth (returns 401
 * even on the `initialize` handshake), so locally we serve a small fixture
 * catalog. Same interface as the real client — swap at the module level when
 * prod credentials land.
 */
@Injectable()
export class MockInstamartClient implements InstamartClient {
  private readonly logger = new Logger(MockInstamartClient.name);

  private readonly catalog: InstamartProduct[] = [
    { id: 'im_acrylic_red_50', name: 'Acrylic Paint Red 50ml', brand: 'Camlin', imageUrl: 'https://picsum.photos/seed/acrylic_red/300', pricePaise: 12000, unit: '50ml', inStock: true },
    { id: 'im_acrylic_white_50', name: 'Acrylic Paint White 50ml', brand: 'Camlin', imageUrl: 'https://picsum.photos/seed/acrylic_white/300', pricePaise: 12000, unit: '50ml', inStock: true },
    { id: 'im_paintbrush_set', name: 'Paint Brush Set (6 pcs)', brand: 'Faber-Castell', imageUrl: 'https://picsum.photos/seed/brush_set/300', pricePaise: 18000, unit: '6 pcs', inStock: true },
    { id: 'im_air_dry_clay', name: 'Air-Dry Clay 500g', brand: 'DIY Crafts', imageUrl: 'https://picsum.photos/seed/clay/300', pricePaise: 24900, unit: '500g', inStock: true },
    { id: 'im_glass_jar', name: 'Glass Mason Jar 250ml', brand: 'Borosil', imageUrl: 'https://picsum.photos/seed/mason_jar/300', pricePaise: 14900, unit: '1 pc', inStock: true },
    { id: 'im_fairy_lights', name: 'Warm LED Fairy Lights 5m', brand: 'Wipro', imageUrl: 'https://picsum.photos/seed/fairy/300', pricePaise: 19900, unit: '5m', inStock: true },
    { id: 'im_lime', name: 'Limes 250g', brand: 'Farm Fresh', imageUrl: 'https://picsum.photos/seed/lime/300', pricePaise: 4500, unit: '250g', inStock: true },
    { id: 'im_mint', name: 'Mint Leaves 50g', brand: 'Farm Fresh', imageUrl: 'https://picsum.photos/seed/mint/300', pricePaise: 3000, unit: '50g', inStock: true },
    { id: 'im_soda', name: 'Club Soda 750ml', brand: 'Schweppes', imageUrl: 'https://picsum.photos/seed/soda/300', pricePaise: 6000, unit: '750ml', inStock: true },
    { id: 'im_sugar', name: 'Castor Sugar 500g', brand: 'Trust', imageUrl: 'https://picsum.photos/seed/sugar/300', pricePaise: 7500, unit: '500g', inStock: true },
    { id: 'im_water_gun', name: 'Water Gun Pistol (Medium)', brand: 'Funskool', imageUrl: 'https://picsum.photos/seed/water_gun/300', pricePaise: 29900, unit: '1 pc', inStock: true },
    { id: 'im_balloons', name: 'Water Balloons (100 pcs)', brand: 'PartyTime', imageUrl: 'https://picsum.photos/seed/balloons/300', pricePaise: 9900, unit: '100 pcs', inStock: true },
    { id: 'im_polaroid_film', name: 'Instax Mini Film (10 sheets)', brand: 'Fujifilm', imageUrl: 'https://picsum.photos/seed/instax/300', pricePaise: 79900, unit: '10 sheets', inStock: true },
    { id: 'im_sketchbook', name: 'A5 Sketchbook 80 pages', brand: 'Classmate', imageUrl: 'https://picsum.photos/seed/sketchbook/300', pricePaise: 14900, unit: '1 pc', inStock: true },
    { id: 'im_charcoal', name: 'Charcoal Pencils (Set of 4)', brand: 'Apsara', imageUrl: 'https://picsum.photos/seed/charcoal/300', pricePaise: 9900, unit: '4 pcs', inStock: true },
  ];

  private readonly baskets = new Map<string, InstamartBasket>();

  async searchProducts(query: string): Promise<InstamartProduct[]> {
    const q = query.toLowerCase();
    return this.catalog.filter((p) =>
      p.name.toLowerCase().includes(q) || (p.brand ?? '').toLowerCase().includes(q),
    );
  }

  async getProduct(id: string): Promise<InstamartProduct | null> {
    return this.catalog.find((p) => p.id === id) ?? null;
  }

  async createBasket(items: Array<{ productId: string; qty: number }>): Promise<InstamartBasket> {
    const resolved = items.map((item) => {
      const product = this.catalog.find((p) => p.id === item.productId);
      if (!product) throw new NotFoundException(`Product ${item.productId} not in catalog`);
      return { ...item, product };
    });
    const subtotalPaise = resolved.reduce((s, r) => s + r.product.pricePaise * r.qty, 0);
    const deliveryFeePaise = subtotalPaise > 19900 ? 0 : 2500;
    const basket: InstamartBasket = {
      id: `bskt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      items: resolved,
      subtotalPaise,
      deliveryFeePaise,
      totalPaise: subtotalPaise + deliveryFeePaise,
    };
    this.baskets.set(basket.id, basket);
    this.logger.log(`Created mock basket ${basket.id} with ${basket.items.length} items, total ₹${(basket.totalPaise / 100).toFixed(2)}`);
    return basket;
  }

  async initiateCheckout(basketId: string, userId: string): Promise<InstamartCheckoutResult> {
    const basket = this.baskets.get(basketId);
    if (!basket) throw new NotFoundException(`Basket ${basketId} not found`);
    const orderRef = `imord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.logger.log(`Mock checkout for user ${userId} basket ${basketId} → ${orderRef}`);
    return {
      orderRef,
      checkoutUrl: `https://www.swiggy.com/instamart/checkout?mockBasket=${basketId}`,
      affiliateAttributionId: `aff_sidequest_${orderRef}`,
    };
  }
}
