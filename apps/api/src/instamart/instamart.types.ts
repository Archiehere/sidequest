export interface InstamartProduct {
  id: string;
  name: string;
  brand?: string;
  imageUrl: string;
  pricePaise: number;
  unit: string;
  inStock: boolean;
}

export interface InstamartBasketItem {
  productId: string;
  qty: number;
}

export interface InstamartBasket {
  id: string;
  items: Array<InstamartBasketItem & { product: InstamartProduct }>;
  subtotalPaise: number;
  deliveryFeePaise: number;
  totalPaise: number;
}

export interface InstamartCheckoutResult {
  orderRef: string;
  checkoutUrl: string;
  affiliateAttributionId: string;
}
