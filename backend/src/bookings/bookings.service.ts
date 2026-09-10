import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, UserRole } from '../common/enums';

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  REQUESTED: [BookingStatus.ASSIGNED, BookingStatus.CANCELLED],
  ASSIGNED: [BookingStatus.ACCEPTED, BookingStatus.CANCELLED],
  ACCEPTED: [BookingStatus.WORKER_ON_THE_WAY, BookingStatus.CANCELLED],
  WORKER_ON_THE_WAY: [BookingStatus.ARRIVED, BookingStatus.CANCELLED],
  ARRIVED: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  IN_PROGRESS: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  COMPLETED: [BookingStatus.PAYMENT_RELEASED],
  PAYMENT_RELEASED: [BookingStatus.RATED],
  RATED: [],
  CANCELLED: [],
  DISPUTED: [],
};

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, data: any) {
    const service = await this.prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service) throw new NotFoundException('Service not found');

    const isEmergency = data.isEmergency || false;
    const basePrice = isEmergency && service.emergencyPrice ? service.emergencyPrice : service.basePrice;
    const platformFee = Math.round(basePrice * service.platformFee * 100) / 100;
    const taxAmount = 0;
    const totalAmount = basePrice + platformFee + taxAmount;
    const workerEarning = Math.round(basePrice * service.workerCommission * 100) / 100;
    const cooperativeShare = Math.round(basePrice * service.cooperativeShare * 100) / 100;

    const booking = await this.prisma.booking.create({
      data: {
        customerId,
        workerId: data.workerId || null,
        serviceId: data.serviceId,
        status: data.workerId ? BookingStatus.ASSIGNED : BookingStatus.REQUESTED,
        isEmergency,
        addressText: data.addressText,
        latitude: data.latitude,
        longitude: data.longitude,
        scheduledDate: new Date(data.scheduledDate),
        scheduledTime: data.scheduledTime,
        description: data.description,
        imageUrls: data.imageUrls ? (Array.isArray(data.imageUrls) ? data.imageUrls.join(',') : String(data.imageUrls)) : null,
        serviceCharge: basePrice,
        platformFee,
        taxAmount,
        totalAmount,
        workerEarning,
        cooperativeShare,
        statusHistory: {
          create: {
            status: data.workerId ? BookingStatus.ASSIGNED : BookingStatus.REQUESTED,
            changedBy: customerId,
          },
        },
      },
      include: {
        service: true,
        worker: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            cooperative: { select: { name: true } },
          },
        },
        customer: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    // Notify worker if assigned
    if (data.workerId) {
      const worker = await this.prisma.worker.findUnique({
        where: { id: data.workerId },
        include: { user: true },
      });
      if (worker) {
        await this.prisma.notification.create({
          data: {
            userId: worker.user.id,
            title: isEmergency ? '🚨 Emergency Job Request' : 'New Job Request',
            message: `You have a new ${service.name} job request.`,
            type: 'BOOKING_REQUEST',
            data: JSON.stringify({ bookingId: booking.id }),
          },
        });
      }
    }

    return booking;
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        worker: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true } },
            cooperative: { select: { name: true } },
          },
        },
        customer: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true } },
          },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        payment: true,
        invoice: true,
        rating: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findByCustomer(customerId: string, status?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where: any = { customerId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          service: true,
          worker: {
            include: {
              user: { select: { firstName: true, lastName: true } },
              cooperative: { select: { name: true } },
            },
          },
          statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
          rating: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { bookings, total, page, limit };
  }

  async updateStatus(
    id: string,
    newStatus: BookingStatus,
    userId: string,
    userRole: UserRole,
    note?: string,
    workerId?: string,
  ) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    // Allow resetting to REQUESTED for testing/simulation
    if (newStatus === BookingStatus.REQUESTED) {
      return this.prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.REQUESTED,
          startedAt: null,
          completedAt: null,
          cancelledAt: null,
          statusHistory: {
            create: {
              status: BookingStatus.REQUESTED,
              note: note || 'Reset to requested state for testing',
              changedBy: userId,
            },
          },
        },
        include: {
          service: true,
          worker: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, phone: true } },
              cooperative: { select: { name: true } },
            },
          },
          customer: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, phone: true } },
            },
          },
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      });
    }

    const validNext = VALID_TRANSITIONS[booking.status];
    const stepOrder: BookingStatus[] = [
      BookingStatus.REQUESTED,
      BookingStatus.ASSIGNED,
      BookingStatus.ACCEPTED,
      BookingStatus.WORKER_ON_THE_WAY,
      BookingStatus.ARRIVED,
      BookingStatus.IN_PROGRESS,
      BookingStatus.COMPLETED,
      BookingStatus.PAYMENT_RELEASED,
      BookingStatus.RATED,
    ];
    const fromIdx = stepOrder.indexOf(booking.status as BookingStatus);
    const toIdx = stepOrder.indexOf(newStatus);

    if (validNext && !validNext.includes(newStatus)) {
      // Allow forward jump or demo navigation
      if (fromIdx === -1 || toIdx === -1) {
        throw new BadRequestException(`Cannot transition from ${booking.status} to ${newStatus}`);
      }
    }

    // Role-based permission checks (relaxed for customer demo simulations if no worker yet)
    if (userRole === UserRole.WORKER) {
      const worker = await this.prisma.worker.findUnique({ where: { userId } });
      if (worker && booking.workerId && booking.workerId !== worker.id) {
        throw new ForbiddenException('Not assigned to this booking');
      }
    }

    const updateData: any = { status: newStatus };
    if (toIdx >= stepOrder.indexOf(BookingStatus.IN_PROGRESS) && !booking.startedAt) {
      updateData.startedAt = new Date();
    }
    if (toIdx >= stepOrder.indexOf(BookingStatus.COMPLETED) && !booking.completedAt) {
      updateData.completedAt = new Date();
    }
    if (newStatus === BookingStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = note;
    }

    // Auto-create payment & invoice if advancing to or past PAYMENT_RELEASED
    if (toIdx >= stepOrder.indexOf(BookingStatus.PAYMENT_RELEASED)) {
      await this.prisma.payment.upsert({
        where: { bookingId: id },
        create: {
          bookingId: id,
          amount: booking.totalAmount,
          method: 'UPI',
          status: 'PAID',
          transactionId: `TXN-COGIG-${Date.now().toString(36).toUpperCase()}`,
          paidAt: new Date(),
        },
        update: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      const invoiceCount = await this.prisma.invoice.count();
      const invoiceNumber = `SAH-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(6, '0')}`;
      await this.prisma.invoice.upsert({
        where: { bookingId: id },
        create: {
          bookingId: id,
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
    }

    // Auto-assign worker if none exists when moving to ASSIGNED or beyond
    if (workerId) {
      updateData.workerId = workerId;
    } else if (!booking.workerId && newStatus !== BookingStatus.CANCELLED) {
      // Find worker skilled in this service, or verified available worker
      const skilledWorker = await this.prisma.workerSkill.findFirst({
        where: { serviceId: booking.serviceId },
        include: { worker: true },
      });
      if (skilledWorker) {
        updateData.workerId = skilledWorker.workerId;
      } else {
        const anyWorker = await this.prisma.worker.findFirst({
          where: { verificationStatus: 'VERIFIED' },
        });
        if (anyWorker) updateData.workerId = anyWorker.id;
      }
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        ...updateData,
        statusHistory: {
          create: {
            status: newStatus,
            note,
            changedBy: userId,
          },
        },
      },
      include: {
        service: true,
        worker: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, phone: true } },
            cooperative: { select: { name: true } },
          },
        },
        customer: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, phone: true } },
          },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        payment: true,
        invoice: true,
        rating: true,
      },
    });

    // Update worker workload
    if (newStatus === BookingStatus.ACCEPTED && booking.workerId) {
      await this.prisma.worker.update({
        where: { id: booking.workerId },
        data: { currentWorkload: { increment: 1 } },
      });
    }
    if (newStatus === BookingStatus.COMPLETED && booking.workerId) {
      await this.prisma.worker.update({
        where: { id: booking.workerId },
        data: {
          currentWorkload: { decrement: 1 },
          totalJobs: { increment: 1 },
          totalEarnings: { increment: booking.workerEarning },
        },
      });
    }

    // Notifications
    const statusMessages: Record<string, { userId: string; title: string; message: string }[]> = {
      ACCEPTED: [
        {
          userId: updated.customer.user.id,
          title: 'Booking Accepted',
          message: `${updated.worker?.user.firstName} has accepted your ${updated.service.name} booking.`,
        },
      ],
      WORKER_ON_THE_WAY: [
        {
          userId: updated.customer.user.id,
          title: 'Worker On The Way',
          message: `${updated.worker?.user.firstName} is on the way to your location.`,
        },
      ],
      COMPLETED: [
        {
          userId: updated.customer.user.id,
          title: 'Service Completed',
          message: `Your ${updated.service.name} service has been completed. Please make the payment.`,
        },
      ],
    };

    const notifications = statusMessages[newStatus];
    if (notifications) {
      await this.prisma.notification.createMany({
        data: notifications.map(n => ({
          userId: n.userId,
          title: n.title,
          message: n.message,
          type: 'BOOKING_UPDATE',
          data: JSON.stringify({ bookingId: id }),
        })),
      });
    }

    return updated;
  }

  async getAllBookings(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          service: { select: { name: true, category: true } },
          worker: {
            include: {
              user: { select: { firstName: true, lastName: true } },
              cooperative: { select: { name: true } },
            },
          },
          customer: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          payment: { select: { status: true, method: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { bookings, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
