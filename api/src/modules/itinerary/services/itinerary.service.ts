import { Injectable, NotFoundException } from '@nestjs/common';
import { ItineraryRepository } from '../repositories/itinerary.repository';
import { CreateChecklistDto, UpdateChecklistDto, SaveFullItineraryDto } from '../dto/checklist.dto';

@Injectable()
export class ItineraryService {
  constructor(private readonly itineraryRepository: ItineraryRepository) { }

  async getUserItineraries(userId: number) {
      return this.itineraryRepository.findByUserId(userId);
    }

  async getItineraryById(id: number) {
      const itinerary = await this.itineraryRepository.findById(id);
      if (!itinerary) {
        throw new NotFoundException(`Lịch trình #${id} không tồn tại`);
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

  async saveFullItinerary(dto: SaveFullItineraryDto) {
      return this.itineraryRepository.saveFullItinerary(dto);
    }
  }
