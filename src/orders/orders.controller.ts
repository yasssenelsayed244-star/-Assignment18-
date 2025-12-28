import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@GetUser('id') userId: number, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(userId, dto);
  }

  @Get()
  findAll(@GetUser('id') userId: number) {
    return this.ordersService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @GetUser('id') userId: number,
    @Param('id', new ParseIntPipe()) orderId: number,
  ) {
    return this.ordersService.findOne(userId, orderId);
  }
}

