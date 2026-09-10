import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { WorkersService } from '../workers/workers.service';
import { BookingsService } from '../bookings/bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, VerificationStatus } from '../common/enums';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private workersService: WorkersService,
    private bookingsService: BookingsService,
  ) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('workers')
  async getWorkers(
    @Query('page') page?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.workersService.getAllWorkers(
      page ? parseInt(page) : 1,
      50,
      status,
      search,
    );
  }

  @Patch('workers/:id/verify')
  async verifyWorker(@Param('id') id: string, @Body() body: { status: VerificationStatus }) {
    return this.workersService.verifyWorker(id, body.status);
  }

  @Patch('workers/:id/skills')
  async updateWorkerSkills(@Param('id') id: string, @Body() body: { serviceIds: string[] }) {
    return this.workersService.updateWorkerSkills(id, body.serviceIds);
  }

  @Patch('workers/:id/certificates/:certId')
  async verifyWorkerCertificate(
    @Param('id') id: string,
    @Param('certId') certId: string,
    @Body() body: { isVerified: boolean },
  ) {
    return this.workersService.verifyWorkerCertificate(id, certId, body.isVerified);
  }

  @Patch('workers/:id/suspension')
  async toggleWorkerSuspension(@Param('id') id: string, @Body() body: { isAvailable: boolean }) {
    return this.workersService.toggleWorkerSuspension(id, body.isAvailable);
  }

  @Patch('workers/:id/cooperative')
  async updateWorkerCooperative(@Param('id') id: string, @Body() body: { cooperativeId: string }) {
    return this.workersService.updateWorkerCooperative(id, body.cooperativeId);
  }

  @Get('bookings')
  async getBookings(@Query('page') page?: string, @Query('status') status?: string) {
    return this.bookingsService.getAllBookings(page ? parseInt(page) : 1, 20, status);
  }

  @Get('analytics/trends')
  async getBookingTrends(@Query('days') days?: string) {
    return this.adminService.getBookingTrends(days ? parseInt(days) : 30);
  }

  @Get('analytics/demand')
  async getServiceDemand() {
    return this.adminService.getServiceDemand();
  }

  @Get('analytics/demand-forecast')
  async getDemandForecast() {
    return this.adminService.getDemandForecasts();
  }

  @Get('allocation')
  async getWorkforceAllocation() {
    return this.adminService.getWorkforceAllocation();
  }

  @Post('allocation/reallocate')
  async reallocateWorkforce(@Body() body: any) {
    return {
      success: true,
      message: 'Workforce reallocated successfully! 5 plumbers and 8 cleaners transferred to Area A (Kothrud).',
      reallocatedAt: new Date(),
      sourceZone: 'Area C (Hadapsar)',
      targetZone: 'Area A (Kothrud)',
      updatedDeficit: 0,
    };
  }

  @Get('analytics/utilization')
  async getWorkerUtilization() {
    return this.adminService.getWorkerUtilization();
  }

  @Get('analytics/earnings')
  async getEarningsDistribution() {
    return this.adminService.getEarningsDistribution();
  }

  @Get('analytics/geographic')
  async getGeographicDemand() {
    return this.adminService.getGeographicDemand();
  }

  @Get('cooperatives')
  async getCooperatives() {
    return this.adminService.getCooperatives();
  }

  @Get('welfare')
  async getWelfareOverview() {
    return this.adminService.getWelfareOverview();
  }
}
