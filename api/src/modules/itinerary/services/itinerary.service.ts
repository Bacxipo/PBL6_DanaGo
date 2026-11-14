import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ItineraryRepository } from '../repositories/itinerary.repository';
import { CreateChecklistDto, UpdateChecklistDto, SaveFullItineraryDto } from '../dto/checklist.dto';

type Requester = { sub: number; role?: string };

const canManageAll = (user: Requester) => user.role === 'ADMIN' || user.role === 'STAFF';

@Injectable()
export class ItineraryService {
  constructor(private readonly itineraryRepository: ItineraryRepository) { }

  async getUserItineraries(userId: number, user: Requester) {
      if (userId !== Number(user.sub) && !canManageAll(user)) {
        throw new ForbiddenException('Bạn chỉ được xem lịch trình của chính mình.');
      }
      return this.itineraryRepository.findByUserId(userId);
    }

  async getItineraryById(id: number, user: Requester) {
      const itinerary = await this.itineraryRepository.findById(id);
      if (!itinerary) {
        throw new NotFoundException(`Lịch trình #${id} không tồn tại`);
      }
      if (itinerary.userId !== Number(user.sub) && !canManageAll(user)) {
        throw new ForbiddenException('Bạn không có quyền xem lịch trình này.');
      }
      return itinerary;
    }

  async getAllChecklists() {
      return this.itineraryRepository.getAllChecklists();
    }

  async getChecklistsByItinerary(itineraryId: number) {
      return this.itineraryRepository.findChecklistsByItinerary(itineraryId);
    }

  async getChecklistsByItem(itemId: number) {
      return this.itineraryRepository.findChecklistsByItem(itemId);
    }

  async createChecklistItem(itemId: number, dto: CreateChecklistDto) {
      return this.itineraryRepository.createChecklistItem(
        itemId,
        dto.itemName,
        dto.isChecked ?? false,
      );
    }

  async updateChecklistItem(id: number, dto: UpdateChecklistDto) {
      return this.itineraryRepository.updateChecklistItem(id, dto);
    }

  async deleteChecklistItem(id: number) {
      return this.itineraryRepository.deleteChecklistItem(id);
    }

  async deleteItinerary(id: number, user: Requester) {
      await this.getItineraryById(id, user);
      return this.itineraryRepository.deleteItinerary(id);
    }

  // Luôn gán lịch trình cho người đang đăng nhập (bỏ qua userId client gửi lên)
  async saveFullItinerary(dto: SaveFullItineraryDto, userId: number) {
      const id = dto.id && !isNaN(Number(dto.id)) ? Number(dto.id) : null;
      if (id) {
        const existing = await this.itineraryRepository.findById(id);
        if (existing && existing.userId !== userId) {
          throw new ForbiddenException('Bạn không có quyền sửa lịch trình này.');
        }
      }
      return this.itineraryRepository.saveFullItinerary({ ...dto, userId });
    }
  }
