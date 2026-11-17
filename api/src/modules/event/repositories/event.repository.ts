import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { ContentStatus, NotificationType, UserStatus } from '@prisma/client';

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) { }

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
    const existing = await this.prisma.event.findUnique({
      where: { id },
      select: { status: true },
    });

    const updated = await this.prisma.event.update({
      where: { id },
      data: { status },
      include: {
        images: true,
        destination: { select: { id: true, name: true, district: true } },
      },
    });

    // Khi Admin duyệt sự kiện sang APPROVED (lần đầu), tự động gửi thông báo sự kiện mới cho toàn bộ người dùng đang hoạt động
    if (
      existing &&
      existing.status !== ContentStatus.APPROVED &&
      status === ContentStatus.APPROVED
    ) {
      await this.broadcastEventApprovedNotification(updated);
    }

    return updated;
  }

  private formatDateVi(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private async broadcastEventApprovedNotification(event: {
    id: number;
    name: string;
    description: string | null;
    locationNote: string | null;
    startDate: Date;
    endDate: Date;
    destination?: { name: string } | null;
  }) {
    try {
      const users = await this.prisma.user.findMany({
        where: { status: UserStatus.ACTIVE },
        select: { id: true },
      });
      if (users.length === 0) return;

      const startStr = this.formatDateVi(new Date(event.startDate));
      const endStr = this.formatDateVi(new Date(event.endDate));
      const dateRange = startStr === endStr ? startStr : `${startStr} - ${endStr}`;
      const location =
        event.locationNote?.trim() ||
        event.destination?.name ||
        'Đà Nẵng';
      const title = `Sự kiện mới: ${event.name}`.slice(0, 150);
      const summary = event.description?.trim()
        ? ` ${event.description.trim().slice(0, 160)}`
        : '';
      const content = `Diễn ra ${dateRange} tại ${location}.${summary}`;

      await this.prisma.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          type: NotificationType.PROMOTION,
          title,
          content,
          referenceType: 'EVENT',
          referenceId: event.id,
        })),
      });
    } catch (err) {
      console.error('broadcastEventApprovedNotification error:', err);
    }
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

  // --- Quản lý ảnh của sự kiện (giống destination.repository.ts) ---
  async addImage(eventId: number, imageUrl: string, uploadedBy?: number) {
    return this.prisma.eventImage.create({
      data: { eventId, imageUrl, uploadedBy },
    });
  }

  async findImageById(imageId: number) {
    return this.prisma.eventImage.findUnique({ where: { id: imageId } });
  }

  async deleteImage(imageId: number) {
    await this.prisma.eventImage.delete({ where: { id: imageId } });
    return true;
  }
}
