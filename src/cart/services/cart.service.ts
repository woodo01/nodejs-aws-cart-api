import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { Cart, CartStatuses } from '../models';

function getDate(date = new Date()) {
  date.setHours(0);
  date.setMinutes(0);
  date.setMinutes(0);
  date.setMilliseconds(0);

  return (date.getTime() / 1000).toString();
}

@Injectable()
export class CartService {
  private userCarts: Record<string, Cart> = {};

  findByUserId(userId: string): Cart {
    return this.userCarts[userId];
  }

  createByUserId(user_id: string): Cart {
    const userCart = {
      id: randomUUID(),
      user_id,
      created_at: getDate(),
      updated_at: getDate(),
      status: CartStatuses.OPEN,
      items: [],
    };

    this.userCarts[user_id] = userCart;

    return userCart;
  }

  findOrCreateByUserId(userId: string): Cart {
    const userCart = this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  updateByUserId(userId: string, { items }: Cart): Cart {
    const { id, ...rest } = this.findOrCreateByUserId(userId);

    const updatedCart = {
      id,
      ...rest,
      items: [...items],
    };

    this.userCarts[userId] = { ...updatedCart };

    return { ...updatedCart };
  }

  removeByUserId(userId): void {
    this.userCarts[userId] = null;
  }
}
