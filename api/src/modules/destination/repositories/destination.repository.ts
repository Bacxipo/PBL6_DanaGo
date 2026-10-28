import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { DestinationEntity, DestinationImageEntity } from '../entities/destination.entity';
import { CreateDestinationDto } from '../dto/create-destination.dto';
import { UpdateDestinationDto } from '../dto/update-destination.dto';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class DestinationRepository {
  constructor(private readonly prisma: PrismaService) {}

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
      categoryName: dest.category?.name ?? undefined,
      ticketPrice: dest.ticketPrice ?? undefined,
      openHours: dest.openHours ?? undefined,
      avgRating: dest.avgRating ? Number(dest.avgRating) : 0,
      status: dest.status,
      createdBy: dest.createdBy ?? undefined,
      createdAt: dest.createdAt,
      images: dest.images
        ? dest.images.map((img: any) => ({
            id: img.id,
            destinationId: img.destinationId,
            imageUrl: img.imageUrl,
            uploadedBy: img.uploadedBy ?? undefined,
            createdAt: img.createdAt,
          }))
        : undefined,
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
      include: {
        images: true,
        category: true,
      },
    });
    return this.mapToEntity(created);
  }

  async findAll(status?: ContentStatus): Promise<DestinationEntity[]> {
    const destinations = await this.prisma.destination.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        category: true,
      },
    });
    return destinations.map((d) => this.mapToEntity(d));
  }

  async findById(id: number): Promise<DestinationEntity | null> {
    const destination = await this.prisma.destination.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
      },
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
      include: {
        images: true,
        category: true,
      },
    });
    return this.mapToEntity(updated);
  }

  async updateStatus(id: number, status: ContentStatus): Promise<DestinationEntity> {
    const updated = await this.prisma.destination.update({
      where: { id },
      data: { status },
      include: {
        images: true,
        category: true,
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: number): Promise<boolean> {
    await this.prisma.destination.delete({
      where: { id },
    });
    return true;
  }

  // --- Category query ---
  async getAllCategories() {
    return this.prisma.category.findMany({
      orderBy: { id: 'asc' },
    });
  }

  // --- Image management methods ---
  async addImage(destinationId: number, imageUrl: string, uploadedBy?: number): Promise<DestinationImageEntity> {
    const img = await this.prisma.destinationImage.create({
      data: {
        destinationId,
        imageUrl,
        uploadedBy,
      },
    });
    return {
      id: img.id,
      destinationId: img.destinationId,
      imageUrl: img.imageUrl,
      uploadedBy: img.uploadedBy ?? undefined,
      createdAt: img.createdAt,
    };
  }

  async findImageById(imageId: number): Promise<DestinationImageEntity | null> {
    const img = await this.prisma.destinationImage.findUnique({
      where: { id: imageId },
    });
    if (!img) return null;
    return {
      id: img.id,
      destinationId: img.destinationId,
      imageUrl: img.imageUrl,
      uploadedBy: img.uploadedBy ?? undefined,
      createdAt: img.createdAt,
    };
  }

  async deleteImage(imageId: number): Promise<boolean> {
    await this.prisma.destinationImage.delete({
      where: { id: imageId },
    });
    return true;
  }
}
