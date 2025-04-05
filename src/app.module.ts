import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';

import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';

import { CartItem as CartItemEntity } from './entities/cartItem.entity';
import { Cart as CartEntity } from './entities/cart.entity';
import { Order as OrderEntity } from './entities/order.entity';
import { User as UserEntity } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT')),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [CartItemEntity, CartEntity, OrderEntity, UserEntity],
        synchronize: false,
        //dropSchema: true,
        logging: true,
        autoLoadEntities: true,
        ssl: {
          rejectUnauthorized: false,
        },
        extra: {
          max: 1,
          connectionTimeoutMillis: 10000,
          query_timeout: 4000,
          statement_timeout: 4000,
          keepalive: true,
          keepaliveInitialDelayMillis: 5000,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CartModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
