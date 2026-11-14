import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { LodgingEntity, LodgingImageEntity, AmenityEntity } from '../entities/lodging.entity';
import { CreateLodgingDto } from '../dto/create-lodging.dto';
import { UpdateLodgingDto } from '../dto/update-lodging.dto';

export function inferRegionFromDistrict(district?: string | null): string {
  const d = (district || '').trim();
  if (!d) return 'Đà Nẵng nội thành';
  if (['Hải Châu', 'Sơn Trà', 'Ngũ Hành Sơn', 'Thanh Khê', 'Liên Chiểu', 'Cẩm Lệ'].includes(d)) {
    return 'Đà Nẵng nội thành';
  }
  if (d === 'Hòa Vang') return 'Hòa Vang - Bà Nà';
  if (['Hội An', 'Điện Bàn'].includes(d)) return 'Hội An - Điện Bàn';
  if (['Tân Hiệp', 'Cù Lao Chàm'].includes(d)) return 'Cù Lao Chàm';
  if (d === 'Duy Xuyên') return 'Duy Xuyên - Mỹ Sơn';
  if (['Tam Kỳ', 'Núi Thành', 'Thăng Bình', 'Quế Sơn', 'Phú Ninh'].includes(d)) {
    return 'Nam Quảng Nam';
  }
  if (['Đông Giang', 'Tây Giang', 'Đại Lộc'].includes(d)) return 'Tây Bắc Quảng Nam';
  if (['Nam Giang', 'Phước Sơn', 'Bắc Trà My', 'Nam Trà My', 'Tiên Phước', 'Hiệp Đức'].includes(d)) {
    return 'Tây Nam Quảng Nam';
  }
  return 'Đà Nẵng nội thành';
}

function formatTimeField(val: any, fallback = '14:00'): string {
  if (!val) return fallback;
  if (typeof val === 'string') {
    const m = val.match(/(\d{2}:\d{2})/);
    return m ? m[1] : fallback;
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    const hh = String(val.getUTCHours()).padStart(2, '0');
    const mm = String(val.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return fallback;
}

function parseTimeFieldToDate(val?: string, fallback = '14:00'): Date {
  const raw = (val || fallback).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  const hh = match ? String(Math.min(23, Math.max(0, Number(match[1])))).padStart(2, '0') : '14';
  const mm = match ? String(Math.min(59, Math.max(0, Number(match[2])))).padStart(2, '0') : '00';
  return new Date(`1970-01-01T${hh}:${mm}:00.000Z`);
}

@Injectable()
export class LodgingRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(row: any): LodgingEntity {
    const pricePerNight = Number(row.pricePerNight ?? 0);
    const maxGuests = Math.max(1, Number(row.maxGuests ?? 2));
    const pricePpNight = Math.round(pricePerNight / maxGuests);
    const amenities: string[] = Array.isArray(row.lodgingAmenities)
      ? row.lodgingAmenities
          .map((la: any) => la.amenity?.nameVi)
          .filter((x: any): x is string => Boolean(x))
      : [];
    const amenityIds: number[] = Array.isArray(row.lodgingAmenities)
      ? row.lodgingAmenities
          .map((la: any) => Number(la.amenityId ?? la.amenity?.id))
          .filter((x: number) => Number.isFinite(x))
      : [];

    return {
      id: Number(row.id),
      name: row.name,
      type: row.type,
      district: row.district ?? undefined,
      region: inferRegionFromDistrict(row.district),
      latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : 16.06,
      longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : 108.22,
      pricePerNight,
      pricePpNight,
      maxGuests,
      checkin: formatTimeField(row.checkin, '14:00'),
      checkout: formatTimeField(row.checkout, '12:00'),
      avgRating: row.avgRating !== null && row.avgRating !== undefined ? Number(row.avgRating) : 4.5,
      description: row.description ?? undefined,
      status: row.status || 'APPROVED',
      createdAt: row.createdAt,
      addressUrl: row.addressUrl ?? undefined,
      website: row.website ?? undefined,
      images: Array.isArray(row.images)
        ? row.images.map((img: any) => ({
            id: Number(img.id),
            lodgingId: Number(img.lodgingId),
            imageUrl: img.imageUrl,
            createdAt: img.createdAt,
          }))
        : [],
      amenities,
      amenityIds,
    };
  }

  async getAllAmenities(): Promise<AmenityEntity[]> {
    const list = await this.prisma.amenity.findMany({
      orderBy: [{ category: 'asc' }, { id: 'asc' }],
    });
    return list.map((a) => ({
      id: Number(a.id),
      code: a.code,
      nameVi: a.nameVi,
      category: a.category,
    }));
  }

  async findAll(params: {
    status?: string;
    search?: string;
    type?: string;
    district?: string;
    region?: string;
    guests?: number;
    amenities?: string[];
  }): Promise<LodgingEntity[]> {
    const where: any = {};

    if (params.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { district: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (params.type && params.type !== 'ALL' && params.type !== 'Tất cả') {
      where.type = params.type;
    }

    if (params.district && params.district !== 'ALL' && params.district !== 'Tất cả' && params.district !== 'Tất cả quận') {
      where.district = params.district;
    }

    if (params.guests && Number.isFinite(params.guests) && params.guests > 0) {
      where.maxGuests = { gte: Number(params.guests) };
    }

    const rows = await this.prisma.lodging.findMany({
      where,
      orderBy: [{ avgRating: 'desc' }, { id: 'desc' }],
      include: {
        images: true,
        lodgingAmenities: {
          include: { amenity: true },
        },
      },
    });

    let entities = rows.map((r) => this.mapToEntity(r));

    if (params.region && params.region !== 'ALL' && params.region !== 'Tất cả' && params.region !== 'Tất cả khu vực') {
      const targetRegions = params.region
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (targetRegions.length > 0) {
        entities = entities.filter((e) => e.region && targetRegions.includes(e.region));
      }
    }

    if (params.amenities && params.amenities.length > 0) {
      const reqAmenities = params.amenities.map((a) => a.trim().toLowerCase()).filter(Boolean);
      if (reqAmenities.length > 0) {
        entities = entities.filter((e) => {
          const itemAm = (e.amenities || []).map((a) => a.toLowerCase());
          const desc = (e.description || '').toLowerCase();
          return reqAmenities.every(
            (req) => itemAm.some((ia) => ia.includes(req) || req.includes(ia)) || desc.includes(req),
          );
        });
      }
    }

    return entities;
  }

  async findById(id: number): Promise<LodgingEntity | null> {
    const row = await this.prisma.lodging.findUnique({
      where: { id: BigInt(id) },
      include: {
        images: true,
        lodgingAmenities: {
          include: { amenity: true },
        },
      },
    });
    return row ? this.mapToEntity(row) : null;
  }

  private async resolveAmenityIds(amenityIds?: number[], amenityNames?: string[]): Promise<number[]> {
    const idSet = new Set<number>();
    if (Array.isArray(amenityIds)) {
      for (const id of amenityIds) {
        const n = Number(id);
        if (Number.isInteger(n) && n > 0) idSet.add(n);
      }
    }
    if (Array.isArray(amenityNames) && amenityNames.length > 0) {
      const all = await this.prisma.amenity.findMany();
      for (const rawName of amenityNames) {
        const clean = String(rawName).trim().toLowerCase();
        if (!clean) continue;
        const found = all.find(
          (a) => a.nameVi.toLowerCase() === clean || a.code.toLowerCase() === clean,
        );
        if (found) idSet.add(Number(found.id));
      }
    }
    return Array.from(idSet);
  }

  async create(dto: CreateLodgingDto): Promise<LodgingEntity> {
    const resolvedAmenityIds = await this.resolveAmenityIds(dto.amenityIds, dto.amenities);
    const created = await this.prisma.lodging.create({
      data: {
        name: dto.name,
        type: dto.type,
        district: dto.district ?? 'Sơn Trà',
        latitude: dto.latitude ?? 16.0611,
        longitude: dto.longitude ?? 108.2435,
        pricePerNight: Number(dto.pricePerNight ?? 500000),
        maxGuests: Number(dto.maxGuests ?? 2),
        checkin: parseTimeFieldToDate(dto.checkin, '14:00'),
        checkout: parseTimeFieldToDate(dto.checkout, '12:00'),
        avgRating: dto.avgRating !== undefined ? Number(dto.avgRating) : 4.5,
        description: dto.description,
        addressUrl: dto.addressUrl,
        website: dto.website,
        status: dto.status || 'APPROVED',
        ...(resolvedAmenityIds.length > 0 && {
          lodgingAmenities: {
            create: resolvedAmenityIds.map((amenityId) => ({ amenityId })),
          },
        }),
      },
      include: {
        images: true,
        lodgingAmenities: {
          include: { amenity: true },
        },
      },
    });
    return this.mapToEntity(created);
  }

  async update(id: number, dto: UpdateLodgingDto): Promise<LodgingEntity> {
    const hasAmenityUpdate = dto.amenityIds !== undefined || dto.amenities !== undefined;
    const resolvedAmenityIds = hasAmenityUpdate
      ? await this.resolveAmenityIds(dto.amenityIds, dto.amenities)
      : undefined;

    const updated = await this.prisma.lodging.update({
      where: { id: BigInt(id) },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.district !== undefined && { district: dto.district }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.pricePerNight !== undefined && { pricePerNight: Number(dto.pricePerNight) }),
        ...(dto.maxGuests !== undefined && { maxGuests: Number(dto.maxGuests) }),
        ...(dto.checkin !== undefined && { checkin: parseTimeFieldToDate(dto.checkin, '14:00') }),
        ...(dto.checkout !== undefined && { checkout: parseTimeFieldToDate(dto.checkout, '12:00') }),
        ...(dto.avgRating !== undefined && { avgRating: Number(dto.avgRating) }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.addressUrl !== undefined && { addressUrl: dto.addressUrl }),
        ...(dto.website !== undefined && { website: dto.website }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(resolvedAmenityIds !== undefined && {
          lodgingAmenities: {
            deleteMany: {},
            create: resolvedAmenityIds.map((amenityId) => ({ amenityId })),
          },
        }),
      },
      include: {
        images: true,
        lodgingAmenities: {
          include: { amenity: true },
        },
      },
    });
    return this.mapToEntity(updated);
  }

  async updateStatus(id: number, status: string): Promise<LodgingEntity> {
    const updated = await this.prisma.lodging.update({
      where: { id: BigInt(id) },
      data: { status },
      include: {
        images: true,
        lodgingAmenities: {
          include: { amenity: true },
        },
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: number): Promise<boolean> {
    await this.prisma.lodging.delete({
      where: { id: BigInt(id) },
    });
    return true;
  }

  async addImage(lodgingId: number, imageUrl: string): Promise<LodgingImageEntity> {
    const img = await this.prisma.lodgingImage.create({
      data: {
        lodgingId: BigInt(lodgingId),
        imageUrl,
      },
    });
    return {
      id: Number(img.id),
      lodgingId: Number(img.lodgingId),
      imageUrl: img.imageUrl,
      createdAt: img.createdAt,
    };
  }

  async findImageById(imageId: number): Promise<LodgingImageEntity | null> {
    const img = await this.prisma.lodgingImage.findUnique({
      where: { id: imageId },
    });
    if (!img) return null;
    return {
      id: Number(img.id),
      lodgingId: Number(img.lodgingId),
      imageUrl: img.imageUrl,
      createdAt: img.createdAt,
    };
  }

  async deleteImage(imageId: number): Promise<boolean> {
    await this.prisma.lodgingImage.delete({
      where: { id: imageId },
    });
    return true;
  }
}
