import { Controller, Get, Patch, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, VerificationStatus } from '../common/enums';

@Controller('api/workers')
export class WorkersController {
  constructor(private workersService: WorkersService) {}

  @Get('nearby')
  async findNearby(
    @Query('serviceId') serviceId: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.workersService.findNearby(
      serviceId,
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 15,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  async getMyProfile(@Request() req: any) {
    return this.workersService.findByUserId(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  @Patch('me/profile')
  async updateMyProfile(@Request() req: any, @Body() data: any) {
    const worker = await this.workersService.findByUserId(req.user.sub);
    if (!worker) throw new Error('Worker profile not found');
    return this.workersService.updateProfile(worker.id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  @Get('me/bookings')
  async getMyBookings(@Request() req: any, @Query('status') status?: string) {
    const worker = await this.workersService.findByUserId(req.user.sub);
    if (!worker) throw new Error('Worker profile not found');
    return this.workersService.getWorkerBookings(worker.id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  @Get('me/earnings')
  async getMyEarnings(@Request() req: any, @Query('period') period?: string) {
    const worker = await this.workersService.findByUserId(req.user.sub);
    if (!worker) throw new Error('Worker profile not found');
    return this.workersService.getEarnings(worker.id, period);
  }
}
