import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    const where: any = { isActive: true };
    if (category) {
      where.category = category;
    }
    return this.prisma.service.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.service.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.service.update({ where: { id }, data });
  }

  async getCategories() {
    const services = await this.prisma.service.findMany({
      where: { isActive: true },
      select: { category: true, name: true, icon: true, id: true, basePrice: true, nameHi: true, nameMr: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return services;
  }
}
