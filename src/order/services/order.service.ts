import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { Order } from '../models';

@Injectable()
export class OrderService {
  private orders: Record<string, Order> = {};

  findById(orderId: string): Order {
    return this.orders[orderId];
  }

  create(data: any) {
    const id = randomUUID();
    const order = {
      ...data,
      id,
      status: 'inProgress',
    };

    this.orders[id] = order;

    return order;
  }

  update(orderId, data) {
    const order = this.findById(orderId);

    if (!order) {
      throw new Error('Order does not exist.');
    }

    this.orders[orderId] = {
      ...data,
      id: orderId,
    };
  }
}
