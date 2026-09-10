import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ComplaintStatus, ComplaintCategory } from '../common/enums';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

  async create(bookingId: string, customerId: string, category: ComplaintCategory, description: string) {
    return this.prisma.complaint.create({
      data: { bookingId, customerId, category, description },
      include: {
        booking: { include: { service: true } },
        customer: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
  }

  async findAll(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [complaints, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        include: {
          booking: { include: { service: { select: { name: true } } } },
          customer: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.complaint.count({ where }),
    ]);

    return { complaints, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(id: string, status: ComplaintStatus, resolutionNote?: string, assignedTo?: string) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Complaint not found');

    return this.prisma.complaint.update({
      where: { id },
      data: {
        status,
        ...(resolutionNote && { resolutionNote }),
        ...(assignedTo && { assignedTo }),
      },
    });
  }
}
