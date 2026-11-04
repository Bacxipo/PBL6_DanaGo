import { Injectable, NotFoundException } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { UpdateEventStatusDto } from '../dto/update-event-status.dto';
import { EventNotFoundException } from '../exceptions/event-not-found.exception';
import { SupabaseStorageService } from '../../../shared/storage/supabase-storage.service';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async createEvent(dto: CreateEventDto, userId?: number) {
    return this.eventRepository.create(dto, userId);
  }

  async getAllEvents(status?: ContentStatus, currentUserId?: number) {
    return this.eventRepository.findAll(status || ContentStatus.APPROVED, currentUserId);
  }

  async getEventById(id: number, currentUserId?: number) {
    const event = await this.eventRepository.findById(id, currentUserId);
    if (!event) {
      throw new EventNotFoundException(id);
    }
    return event;
  }

  async updateEvent(id: number, dto: UpdateEventDto) {
    await this.getEventById(id);
    return this.eventRepository.update(id, dto);
  }

  async updateEventStatus(id: number, dto: UpdateEventStatusDto) {
    await this.getEventById(id);
    return this.eventRepository.updateStatus(id, dto.status);
  }

  async deleteEvent(id: number) {
    await this.getEventById(id);
    await this.eventRepository.delete(id);
    return { message: `Đã xóa sự kiện ID ${id} thành công.` };
  }

  async toggleFavorite(eventId: number, userId: number) {
    await this.getEventById(eventId);
    return this.eventRepository.toggleFavorite(eventId, userId);
  }

  // --- Upload và xóa ảnh sự kiện (giống destination.service.ts) ---
  async uploadImages(
    eventId: number,
    files: Express.Multer.File[],
    userId?: number,
  ): Promise<{ id: number; imageUrl: string }[]> {
    await this.getEventById(eventId);

    const uploadedResults: { id: number; imageUrl: string }[] = [];
    for (const file of files) {
      const imageUrl = await this.storageService.uploadFile(
        file,
        'event_image',
        `event-${eventId}`,
      );
      const savedImg = await this.eventRepository.addImage(eventId, imageUrl, userId);
      uploadedResults.push({ id: savedImg.id, imageUrl: savedImg.imageUrl });
    }

    return uploadedResults;
  }

  async deleteImage(imageId: number): Promise<{ message: string }> {
    const image = await this.eventRepository.findImageById(imageId);
    if (!image) {
      throw new NotFoundException(`Không tìm thấy ảnh với ID ${imageId}`);
    }

    await this.storageService.deleteFileByUrl(image.imageUrl, 'event_image');
    await this.eventRepository.deleteImage(imageId);

    return { message: `Đã xóa ảnh ID ${imageId} thành công.` };
  }
}
