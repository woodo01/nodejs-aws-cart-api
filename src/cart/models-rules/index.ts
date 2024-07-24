import { CartItem } from '../models';

/**
 * @param {Cart} cart
 * @returns {number}
 */
export function calculateCartTotal(items: CartItem[]): number {
  return items.length
    ? items.reduce((acc: number, { product: { price }, count }: CartItem) => {
        return (acc += price * count);
      }, 0)
    : 0;
}
