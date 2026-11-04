import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto, userId?: number) {
    return this.prisma.event.create({
      data: {
        name: dto.name,
        description: dto.description,
        destinationId: dto.destinationId,
        locationNote: dto.locationNote,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        ticketPrice: dto.ticketPrice ? dto.ticketPrice : 0,
        status: ContentStatus.PENDING,
        createdBy: userId,
        images: dto.images && dto.images.length > 0
          ? {
              create: dto.images.map((url) => ({
                imageUrl: url,
                uploadedBy: userId,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        destination: { select: { id: true, name: true, district: true } },
      },
    });
  }

  async findAll(status: ContentStatus = ContentStatus.APPROVED, currentUserId?: number) {
    const events = await this.prisma.event.findMany({
      where: { status },
      orderBy: { startDate: 'asc' },
      include: {
        images: true,
        destination: { select: { id: true, name: true, district: true } },
        favorites: currentUserId ? { where: { userId: currentUserId } } : false,
      },
    });

    return events.map((event) => ({
      ...event,
      isFavorited: currentUserId ? event.favorites && event.favorites.length > 0 : false,
    }));
  }

  async findById(id: number, currentUserId?: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        images: true,
        destination: { select: { id: true, name: true, district: true } },
        favorites: currentUserId ? { where: { userId: currentUserId } } : false,
      },
    });

    if (!event) return null;

    return {
      ...event,
      isFavorited: currentUserId ? event.favorites && event.favorites.length > 0 : false,
    };
  }

  async update(id: number, dto: UpdateEventDto) {
    return this.prisma.event.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        destinationId: dto.destinationId,
        locationNote: dto.locationNote,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        ticketPrice: dto.ticketPrice !== undefined ? dto.ticketPrice : undefined,
      },
      include: {
        images: true,
        destination: { select: { id: true, name: true, district: true } },
      },
    });
  }

  async updateStatus(id: number, status: ContentStatus) {
    return this.prisma.event.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: number) {
    await this.prisma.event.delete({
      where: { id },
    });
    return true;
  }

  async toggleFavorite(eventId: number, userId: number) {
    const existing = await this.prisma.eventFavorite.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existing) {
      await this.prisma.eventFavorite.delete({
        where: { userId_eventId: { userId, eventId } },
      });
      return { favorited: false };
    } else {
      await this.prisma.eventFavorite.create({
        data: { userId, eventId },
      });
      return { favorited: true };
    }
  }
}
