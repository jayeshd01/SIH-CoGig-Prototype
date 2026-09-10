import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@Controller('api/ratings')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post()
  async createRating(@Body() body: { bookingId: string; score: number; comment?: string }) {
    return this.ratingsService.createRating(body.bookingId, body.score, body.comment);
  }

  @Get('worker/:workerId')
  async getWorkerReviews(@Param('workerId') workerId: string, @Query('page') page?: string) {
    return this.ratingsService.getWorkerReviews(workerId, page ? parseInt(page) : 1);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/flag')
  async flagReview(@Param('id') id: string, @Body() body: { flagged: boolean }) {
    return this.ratingsService.flagReview(id, body.flagged);
  }
}
