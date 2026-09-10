import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, PaymentMethod, BookingStatus } from '../common/enums';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async processPayment(bookingId: string, method: PaymentMethod) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, service: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Booking must be completed before payment');
    }
    if (booking.payment && booking.payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Payment already made');
    }

    // Mock payment gateway - simulates real payment flow
    const transactionId = `TXN-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Simulate payment processing (100% success for demo)
    const isSuccess = true;

    const payment = await this.prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        amount: booking.totalAmount,
        method,
        status: isSuccess ? PaymentStatus.PAID : PaymentStatus.FAILED,
        transactionId,
        gatewayResponse: JSON.stringify({
          gateway: 'mock',
          status: isSuccess ? 'success' : 'failed',
          timestamp: new Date().toISOString(),
        }),
        paidAt: isSuccess ? new Date() : null,
      },
      update: {
        method,
        status: isSuccess ? PaymentStatus.PAID : PaymentStatus.FAILED,
        transactionId,
        paidAt: isSuccess ? new Date() : null,
      },
    });

    if (isSuccess) {
      // Update booking status
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.PAYMENT_RELEASED,
          statusHistory: {
            create: { status: BookingStatus.PAYMENT_RELEASED, note: `Payment via ${method}` },
          },
        },
      });

      // Generate invoice
      const invoiceCount = await this.prisma.invoice.count();
      const invoiceNumber = `SAH-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(6, '0')}`;

      await this.prisma.invoice.upsert({
        where: { bookingId },
        create: {
          bookingId,
          invoiceNumber,
          serviceCharge: booking.serviceCharge,
          platformFee: booking.platformFee,
          taxAmount: booking.taxAmount,
          totalAmount: booking.totalAmount,
          workerEarning: booking.workerEarning,
          cooperativeShare: booking.cooperativeShare,
        },
        update: {},
      });

      // Notify customer and worker
      const notifyBooking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: { include: { user: true } },
          worker: { include: { user: true } },
        },
      });

      if (notifyBooking) {
        await this.prisma.notification.createMany({
          data: [
            {
              userId: notifyBooking.customer.user.id,
              title: 'Payment Successful',
              message: `Your payment of ₹${booking.totalAmount} has been processed.`,
              type: 'PAYMENT',
              data: JSON.stringify({ bookingId }),
            },
            ...(notifyBooking.worker ? [{
              userId: notifyBooking.worker.user.id,
              title: 'Payment Received',
              message: `You earned ₹${booking.workerEarning} for your service.`,
              type: 'PAYMENT',
              data: JSON.stringify({ bookingId }),
            }] : []),
          ],
        });
      }
    }

    return {
      payment,
      success: isSuccess,
      message: isSuccess ? 'Payment successful' : 'Payment failed. Please try again.',
    };
  }

  async getInvoice(bookingId: string) {
    let invoice = await this.prisma.invoice.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            service: true,
            customer: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } } },
            worker: {
              include: {
                user: { select: { firstName: true, lastName: true, phone: true } },
                cooperative: { select: { name: true, registrationNo: true, address: true } },
              },
            },
            payment: true,
          },
        },
      },
    });

    if (!invoice) {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
      });
      if (booking) {
        const invoiceCount = await this.prisma.invoice.count();
        const invoiceNumber = `SAH-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(6, '0')}`;
        invoice = await this.prisma.invoice.create({
          data: {
            bookingId,
            invoiceNumber,
            serviceCharge: booking.serviceCharge,
            platformFee: booking.platformFee,
            taxAmount: booking.taxAmount,
            totalAmount: booking.totalAmount,
            workerEarning: booking.workerEarning,
            cooperativeShare: booking.cooperativeShare,
          },
          include: {
            booking: {
              include: {
                service: true,
                customer: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } } },
                worker: {
                  include: {
                    user: { select: { firstName: true, lastName: true, phone: true } },
                    cooperative: { select: { name: true, registrationNo: true, address: true } },
                  },
                },
                payment: true,
              },
            },
          },
        });
      }
    }

    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async getPaymentsByBooking(bookingId: string) {
    return this.prisma.payment.findUnique({ where: { bookingId } });
  }
}
