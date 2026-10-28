import { Injectable, NotFoundException } from '@nestjs/common';
import { DestinationRepository } from '../repositories/destination.repository';
import { DestinationMapper } from '../mappers/destination.mapper';
import { DestinationResponseDto, DestinationImageDto } from '../dto/destination-response.dto';
import { CreateDestinationDto } from '../dto/create-destination.dto';
import { UpdateDestinationDto } from '../dto/update-destination.dto';
import { UpdateDestinationStatusDto } from '../dto/update-destination-status.dto';
import { DestinationNotFoundException } from '../exceptions/destination-not-found.exception';
import { SupabaseStorageService } from '../../../shared/storage/supabase-storage.service';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class DestinationService {
  constructor(
    private readonly destinationRepository: DestinationRepository,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async createDestination(dto: CreateDestinationDto, userId?: number): Promise<DestinationResponseDto> {
    const created = await this.destinationRepository.create(dto, userId);
    return DestinationMapper.toResponseDto(created);
  }

  async getAllDestinations(status?: ContentStatus): Promise<DestinationResponseDto[]> {
    const list = await this.destinationRepository.findAll(status);
    return list.map((item) => DestinationMapper.toResponseDto(item));
  }

  async getAllCategories() {
    return this.destinationRepository.getAllCategories();
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

  // --- Upload and manage Destination Images ---
  async uploadImages(
    destinationId: number,
    files: Express.Multer.File[],
    userId?: number,
  ): Promise<DestinationImageDto[]> {
    await this.getDestinationById(destinationId);

    const uploadedResults: DestinationImageDto[] = [];
    for (const file of files) {
      // 1. Upload lên Supabase Storage bucket 'destinations'
      const imageUrl = await this.storageService.uploadFile(
        file,
        'destination_image',
        `dest-${destinationId}`,
      );

      // 2. Lưu URL vào bảng destination_image
      const savedImg = await this.destinationRepository.addImage(destinationId, imageUrl, userId);
      uploadedResults.push({
        id: savedImg.id,
        imageUrl: savedImg.imageUrl,
      });
    }

    return uploadedResults;
  }

  async deleteImage(imageId: number): Promise<{ message: string }> {
    const image = await this.destinationRepository.findImageById(imageId);
    if (!image) {
      throw new NotFoundException(`Không tìm thấy ảnh với ID ${imageId}`);
    }

    // Xóa trên Supabase Storage
    await this.storageService.deleteFileByUrl(image.imageUrl, 'destination_image');

    // Xóa record trong DB
    await this.destinationRepository.deleteImage(imageId);

    return { message: `Đã xóa ảnh ID ${imageId} thành công.` };
  }
}
