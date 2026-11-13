import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { DestinationEntity, DestinationImageEntity } from '../entities/destination.entity';
import { CreateDestinationDto } from '../dto/create-destination.dto';
import { UpdateDestinationDto } from '../dto/update-destination.dto';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class DestinationRepository {
  constructor(private readonly prisma: PrismaService) { }

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
      categoryName: dest.category?.name ?? undefined,
      ticketPrice: dest.ticketPrice ?? undefined,
      openHours: dest.openHours ?? undefined,
      avgRating: dest.avgRating ? Number(dest.avgRating) : 0,
      isFeatured: dest.isFeatured ?? false,
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

  async findAll(
    status?: ContentStatus,
    search?: string,
    categoryId?: number,
    district?: string,
  ): Promise<DestinationEntity[]> {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search && search.trim()) {
      where.name = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (district && district !== 'Tất cả quận') {
      where.district = district;
    }

    const destinations = await this.prisma.destination.findMany({
      where,
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

  async updateStatus(
    id: number,
    status: ContentStatus,
  ): Promise<DestinationEntity> {
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
  async findFeatured(limit = 10): Promise<DestinationEntity[]>{
    const destinations = await this.prisma.destination.findMany({
      where: {
        status: ContentStatus.APPROVED,
      },
      orderBy: [
        {isFeatured: 'desc'},
        {avgRating: 'desc'},
        {createdAt: 'desc'},
      ],
      take: limit,
      include:{
        images: true,
        category: true,
      }
    });
    return destinations.map((dest) => this.mapToEntity(dest));
  }
  //tìm địa điểm gợi ý theo sở thích
  async findRecommended(userId?:  number, limit = 6): Promise<DestinationEntity[]>{
    let categoryIds: number[] = [];
    if(userId){
      const prefs = await this.prisma.userPreference.findMany({
        where: {userId},
        select: {categoryId: true},
      });
      categoryIds = prefs.map((p)=> p.categoryId);
    }
    let destinations: any[] = [];
    if(categoryIds.length > 0){
      destinations = await this.prisma.destination.findMany({
        where:{
          status: ContentStatus.APPROVED,
          categoryId: {in: categoryIds},
        },
        orderBy: [{avgRating: 'desc'}, {createdAt: 'desc'}],
        take: limit,
        include: {images: true, category: true},
      });
    }
    if (destinations.length < limit) {
      const existingIds = destinations.map((d) => d.id);
      const fallback = await this.prisma.destination.findMany({
        where: {
          status: ContentStatus.APPROVED,
          id: { notIn: existingIds },
        },
        orderBy: [{ avgRating: 'desc' }, { createdAt: 'desc' }],
        take: limit - destinations.length,
        include: { images: true, category: true },
      });
      destinations = [...destinations, ...fallback];
    }
    return destinations.map((d)=> this.mapToEntity(d));
  }
  async findNearby(userLat?: number, userLng?: number, limit = 6): Promise<DestinationEntity[]>{
      // Nếu chưa có GPS truyền lên, tự động lấy tọa độ Trung tâm Đà Nẵng làm mốc
      const currentLat = userLat ?? 16.0614;
      const currentLng = userLng ?? 108.2272;
      const all = await this.prisma.destination.findMany({
        where: {
          status: ContentStatus.APPROVED,
          latitude: { not: null },
          longitude: { not: null },
        },
        include: { images: true, category: true },
      });
      // tính toán khoảng cách Haversine
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // bán kính trái đất tính bằng km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };
      const destinationsWithDistance = all.map((dest) => {
        const dKm = calculateDistance(currentLat, currentLng, Number(dest.latitude), Number(dest.longitude));
        const entity = this.mapToEntity(dest);
        entity.distance = dKm < 1 ? `${Math.round(dKm * 1000)} m` : `${dKm.toFixed(1)} km`;
        return { entity, distanceVal: dKm };
      });
      destinationsWithDistance.sort((a, b) => a.distanceVal - b.distanceVal);
      return destinationsWithDistance.slice(0, limit).map((item) => item.entity);
  }
}
