import { Injectable } from '@nestjs/common';
import { DestinationRepository } from '../repositories/destination.repository';
import { DestinationMapper } from '../mappers/destination.mapper';
import { DestinationResponseDto } from '../dto/destination-response.dto';
import { CreateDestinationDto } from '../dto/create-destination.dto';
import { UpdateDestinationDto } from '../dto/update-destination.dto';
import { UpdateDestinationStatusDto } from '../dto/update-destination-status.dto';
import { DestinationNotFoundException } from '../exceptions/destination-not-found.exception';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class DestinationService {
  constructor(private readonly destinationRepository: DestinationRepository) {}

  async createDestination(dto: CreateDestinationDto, userId?: number): Promise<DestinationResponseDto> {
    const created = await this.destinationRepository.create(dto, userId);
    return DestinationMapper.toResponseDto(created);
  }

  async getAllDestinations(status?: ContentStatus): Promise<DestinationResponseDto[]> {
    const list = await this.destinationRepository.findAll(status);
    return list.map((item) => DestinationMapper.toResponseDto(item));
  }

  async getDestinationById(id: number): Promise<DestinationResponseDto> {
    const entity = await this.destinationRepository.findById(id);
    if (!entity) {
      throw new DestinationNotFoundException(id);
    }
    return DestinationMapper.toResponseDto(entity);
  }

  async updateDestination(id: number, dto: UpdateDestinationDto): Promise<DestinationResponseDto> {
    await this.getDestinationById(id);
    const updated = await this.destinationRepository.update(id, dto);
    return DestinationMapper.toResponseDto(updated);
  }

  async updateDestinationStatus(id: number, dto: UpdateDestinationStatusDto): Promise<DestinationResponseDto> {
    await this.getDestinationById(id);
    const updated = await this.destinationRepository.updateStatus(id, dto.status);
    return DestinationMapper.toResponseDto(updated);
  }

  async deleteDestination(id: number): Promise<{ message: string }> {
    await this.getDestinationById(id);
    await this.destinationRepository.delete(id);
    return { message: `Đã xóa điểm đến ID ${id} thành công.` };
  }
}
