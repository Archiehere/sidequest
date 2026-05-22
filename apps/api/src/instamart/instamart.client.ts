import { InstamartBasket, InstamartCheckoutResult, InstamartProduct } from './instamart.types';

export const INSTAMART_CLIENT = Symbol('INSTAMART_CLIENT');

export interface InstamartClient {
  searchProducts(query: string): Promise<InstamartProduct[]>;
  getProduct(id: string): Promise<InstamartProduct | null>;
  createBasket(items: Array<{ productId: string; qty: number }>): Promise<InstamartBasket>;
  initiateCheckout(basketId: string, userId: string): Promise<InstamartCheckoutResult>;
}
