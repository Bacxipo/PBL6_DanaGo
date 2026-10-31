import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { DestinationEntity } from '../entities/destination.entity';
import { CreateDestinationDto } from '../dto/create-destination.dto';
import { UpdateDestinationDto } from '../dto/update-destination.dto';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class DestinationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCategories() {
    return this.prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  private mapToEntity(dest: any): DestinationEntity {
    return {
      id: dest.id,
      name: dest.name,
      description: dest.description ?? undefined,
      district: dest.district,
      latitude: dest.latitude ? Number(dest.latitude) : undefined,
      longitude: dest.longitude ? Number(dest.longitude) : undefined,
      addressUrl: dest.addressUrl ?? undefined,
      categoryId: dest.categoryId ?? undefined,
      ticketPrice: dest.ticketPrice ?? undefined,
      openHours: dest.openHours ?? undefined,
      avgRating: dest.avgRating ? Number(dest.avgRating) : 0,
      status: dest.status,
      createdBy: dest.createdBy ?? undefined,
      createdAt: dest.createdAt,
    };
  }

  async create(data: CreateDestinationDto, userId?: number): Promise<DestinationEntity> {
    const created = await this.prisma.destination.create({
      data: {
        name: data.name,
        description: data.description,
        district: data.district,
        latitude: data.latitude,
        longitude: data.longitude,
        addressUrl: data.addressUrl,
        categoryId: data.categoryId,
        ticketPrice: data.ticketPrice,
        openHours: data.openHours,
        status: ContentStatus.PENDING, // Always PENDING when created
        createdBy: userId,
      },
    });
    return this.mapToEntity(created);
  }

  async findAll(status?: ContentStatus): Promise<DestinationEntity[]> {
    const destinations = await this.prisma.destination.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return destinations.map((d) => this.mapToEntity(d));
  }

  async findById(id: number): Promise<DestinationEntity | null> {
    const destination = await this.prisma.destination.findUnique({
      where: { id },
    });
    return destination ? this.mapToEntity(destination) : null;
  }

  async update(id: number, data: UpdateDestinationDto): Promise<DestinationEntity> {
    const updated = await this.prisma.destination.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        district: data.district,
        latitude: data.latitude,
        longitude: data.longitude,
        addressUrl: data.addressUrl,
        categoryId: data.categoryId,
        ticketPrice: data.ticketPrice,
        openHours: data.openHours,
      },
    });
    return this.mapToEntity(updated);
  }

  async updateStatus(id: number, status: ContentStatus): Promise<DestinationEntity> {
    const updated = await this.prisma.$transaction(async (tx) => {
      const sourcePosts = await tx.feedPost.findMany({
        where: { destinationId: id, postType: 'NEW_DESTINATION' },
      });
      for (const post of sourcePosts) {
        if (post.status === status) continue;
        if (post.status !== ContentStatus.PENDING || status === ContentStatus.PENDING) {
          throw new ConflictException('Source post has already been moderated.');
        }
        const claimed = await tx.feedPost.updateMany({
          where: { id: post.id, status: ContentStatus.PENDING },
          data: { status },
        });
        if (claimed.count !== 1) throw new ConflictException('Post was moderated concurrently.');
      }
      return tx.destination.update({ where: { id }, data: { status } });
    });
    return this.mapToEntity(updated);
  }

  async delete(id: number): Promise<boolean> {
    await this.prisma.destination.delete({
      where: { id },
    });
    return true;
  }
}
