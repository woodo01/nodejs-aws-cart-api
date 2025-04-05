import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { CreateOrderPayload } from '../type';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async getAll(): Promise<Order[]> {
    return await this.orderRepository.find();
  }

  async findById(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product'],
    });

    return order;
  }

  async create(data: CreateOrderPayload): Promise<Order> {
    try {
      const order = this.orderRepository.create({
        userId: data.userId,
        ...data,
      });
      const savedOrder = await this.orderRepository.save(order);

      return savedOrder;
    } catch (error) {
      throw new BadRequestException('Failed to create order: ' + error.message);
    }
  }

  // TODO add  type
  async update(orderId: string, data: Partial<Order>): Promise<Order> {
    const order = await this.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order does not exist.');
    }

    Object.assign(order, {
      ...data,
      id: orderId,
    });

    return await this.orderRepository.save(order);
  }
}
