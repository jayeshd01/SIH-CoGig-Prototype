import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@Controller('api/complaints')
export class ComplaintsController {
  constructor(private complaintsService: ComplaintsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post()
  async create(@Request() req: any, @Body() body: any) {
    return this.complaintsService.create(body.bookingId, body.customerId, body.category, body.description);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(@Query('page') page?: string, @Query('status') status?: string) {
    return this.complaintsService.findAll(page ? parseInt(page) : 1, 20, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async updateStatus(@Param('id') id: string, @Body() body: any) {
    return this.complaintsService.updateStatus(id, body.status, body.resolutionNote, body.assignedTo);
  }
}
