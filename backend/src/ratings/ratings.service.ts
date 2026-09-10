import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '../common/enums';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async createRating(bookingId: string, score: number, comment?: string) {
    if (score < 1 || score > 5) throw new BadRequestException('Rating must be between 1 and 5');

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { include: { user: true } },
        worker: true,
        rating: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (!booking.workerId) throw new BadRequestException('No worker assigned');
    if (booking.rating) throw new BadRequestException('Already rated');
    if (![BookingStatus.PAYMENT_RELEASED, BookingStatus.COMPLETED].includes(booking.status as any)) {
      throw new BadRequestException('Payment must be completed before rating');
    }

    const rating = await this.prisma.rating.create({
      data: { bookingId, workerId: booking.workerId, score },
    });

    // Create review if comment provided
    if (comment) {
      await this.prisma.review.create({
        data: {
          workerId: booking.workerId,
          customerName: `${booking.customer.user.firstName} ${booking.customer.user.lastName}`,
          score,
          comment,
        },
      });
    }

    // Update booking status to RATED
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.RATED,
        statusHistory: {
          create: { status: BookingStatus.RATED, note: `Rated ${score}/5` },
        },
      },
    });

    // Recalculate worker average rating
    const ratings = await this.prisma.rating.aggregate({
      where: { workerId: booking.workerId },
      _avg: { score: true },
      _count: true,
    });

    await this.prisma.worker.update({
      where: { id: booking.workerId },
      data: {
        averageRating: Math.round((ratings._avg.score || 0) * 10) / 10,
        ratingCount: ratings._count,
      },
    });

    // Notify worker
    await this.prisma.notification.create({
      data: {
        userId: booking.worker!.userId,
        title: 'New Rating',
        message: `You received a ${score}-star rating.`,
        type: 'RATING',
        data: JSON.stringify({ bookingId }),
      },
    });

    return rating;
  }

  async getWorkerReviews(workerId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { workerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { workerId } }),
    ]);
    return { reviews, total, page, limit };
  }

  async flagReview(reviewId: string, flagged: boolean) {
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { isFlagged: flagged },
    });
  }
}
