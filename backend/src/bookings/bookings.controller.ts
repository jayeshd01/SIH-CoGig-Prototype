import { Controller, Post, Get, Patch, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@Controller('api/bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() data: any) {
    let customer = await this.bookingsService['prisma'].customer.findUnique({
      where: { userId: req.user.sub },
    });
    if (!customer) {
      customer = await this.bookingsService['prisma'].customer.create({
        data: {
          userId: req.user.sub,
          addressText: data.addressText || 'Pune, Maharashtra',
          latitude: data.latitude || 18.5204,
          longitude: data.longitude || 73.8567,
        },
      });
    }
    return this.bookingsService.create(customer.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyBookings(@Request() req: any, @Query('status') status?: string, @Query('page') page?: string) {
    if (req.user.role === UserRole.CUSTOMER) {
      let customer = await this.bookingsService['prisma'].customer.findUnique({
        where: { userId: req.user.sub },
      });
      if (!customer) {
        customer = await this.bookingsService['prisma'].customer.create({
          data: {
            userId: req.user.sub,
            addressText: 'Pune, Maharashtra',
            latitude: 18.5204,
            longitude: 73.8567,
          },
        });
      }
      return this.bookingsService.findByCustomer(customer.id, status, page ? parseInt(page) : 1);
    } else if (req.user.role === UserRole.WORKER) {
      const worker = await this.bookingsService['prisma'].worker.findUnique({
        where: { userId: req.user.sub },
      });
      if (!worker) throw new Error('Worker not found');
      return this.bookingsService['prisma'].booking.findMany({
        where: { workerId: worker.id, ...(status ? { status: status as any } : {}) },
        include: {
          service: true,
          customer: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
          statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { scheduledDate: 'desc' },
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { status: string; note?: string; workerId?: string },
  ) {
    return this.bookingsService.updateStatus(
      id,
      body.status as any,
      req.user.sub,
      req.user.role,
      body.note,
      body.workerId,
    );
  }
}
