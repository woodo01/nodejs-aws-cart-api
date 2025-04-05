import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { CartService } from './services';
import { CreateOrderDto, OrderStatus, PutCartPayload } from 'src/order/type';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cartItem.entity';
import { Order } from '../entities/order.entity';
import { DataSource } from 'typeorm';
import { CartStatuses } from './models';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private readonly dataSource: DataSource,
  ) {}

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest): Promise<CartItem[]> {
    const cart = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req)
    );

    return cart.items;
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: PutCartPayload,
  ): Promise<CartItem[]> {
    // TODO: validate body payload...
    const cart = await this.cartService.updateByUserId(
      getUserIdFromRequest(req),
      body,
    );

    return cart.items;
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearUserCart(@Req() req: AppRequest) {
    await this.cartService.removeByUserId(getUserIdFromRequest(req));
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put('order')
  async checkout(@Req() req: AppRequest, @Body() body: CreateOrderDto) {
    // Start a new transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userId = getUserIdFromRequest(req);

      // Get opened cart for user to use transaction
      const cart = await queryRunner.manager.getRepository(Cart).findOne({
        where: {
          user_id: userId,
          status: CartStatuses.OPEN,
        },
      });

      // Get items for current cart
      const items = await queryRunner.manager.getRepository(CartItem).find({
        where: {
          cart_id: cart.id,
        },
      });
      if (!cart || !items.length) {
        throw new BadRequestException('Cart is empty');
      }

      // Create order within transaction
      const { payment, delivery, comments, total } = body;
      const order = await queryRunner.manager.getRepository(Order).save({
        user_id: userId,
        cart_id: cart.id,
        items,
        payment,
        delivery,
        comments,
        status: OrderStatus.Open,
        total,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Update cart status to ORDERED
      await queryRunner.manager.getRepository(Cart).update(
        { id: cart.id },
        {
          status: CartStatuses.ORDERED,
          updated_at: new Date(),
        },
      );

      // Commit the transaction
      await queryRunner.commitTransaction();

      return { order };
    } catch (err) {
      // Rollback in case of error
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message);
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  @UseGuards(BasicAuthGuard)
  @Get('order')
  async getOrder(): Promise<Order[]> {
    return await this.orderService.getAll();
  }
}
