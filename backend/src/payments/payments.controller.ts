import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async processPayment(@Body() body: { bookingId: string; method: string }) {
    return this.paymentsService.processPayment(body.bookingId, body.method as any);
  }

  @UseGuards(JwtAuthGuard)
  @Get('invoice/:bookingId')
  async getInvoice(@Param('bookingId') bookingId: string) {
    return this.paymentsService.getInvoice(bookingId);
  }
}
