import { Injectable, NotFoundException } from '@nestjs/common';
import { LodgingRepository } from '../repositories/lodging.repository';
import { LodgingMapper } from '../mappers/lodging.mapper';
import { LodgingResponseDto, LodgingImageDto, AmenityResponseDto } from '../dto/lodging-response.dto';
import { CreateLodgingDto } from '../dto/create-lodging.dto';
import { UpdateLodgingDto } from '../dto/update-lodging.dto';
import { UpdateLodgingStatusDto } from '../dto/update-lodging-status.dto';
import { LodgingNotFoundException } from '../exceptions/lodging-not-found.exception';
import { SupabaseStorageService } from '../../../shared/storage/supabase-storage.service';

const LODGING_BUCKET = process.env.SUPABASE_BUCKET_LODGINGS || 'lodgings_image';

@Injectable()
export class LodgingService {
  constructor(
    private readonly lodgingRepository: LodgingRepository,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async getAllAmenities(): Promise<AmenityResponseDto[]> {
    return this.lodgingRepository.getAllAmenities();
  }

  async getAllLodgings(params: {
    status?: string;
    search?: string;
    type?: string;
    district?: string;
    region?: string;
    guests?: number;
    amenities?: string[];
  }): Promise<LodgingResponseDto[]> {
    const list = await this.lodgingRepository.findAll(params);
    return list.map((item) => LodgingMapper.toResponseDto(item));
  }

  async getLodgingById(id: number): Promise<LodgingResponseDto> {
    const entity = await this.lodgingRepository.findById(id);
    if (!entity) {
      throw new LodgingNotFoundException(id);
    }
    return LodgingMapper.toResponseDto(entity);
  }

  async createLodging(dto: CreateLodgingDto): Promise<LodgingResponseDto> {
    const created = await this.lodgingRepository.create(dto);
    return LodgingMapper.toResponseDto(created);
  }

  async updateLodging(id: number, dto: UpdateLodgingDto): Promise<LodgingResponseDto> {
    await this.getLodgingById(id);
    const updated = await this.lodgingRepository.update(id, dto);
    return LodgingMapper.toResponseDto(updated);
  }

  async updateLodgingStatus(id: number, dto: UpdateLodgingStatusDto): Promise<LodgingResponseDto> {
    await this.getLodgingById(id);
    const updated = await this.lodgingRepository.updateStatus(id, dto.status);
    return LodgingMapper.toResponseDto(updated);
  }

  async deleteLodging(id: number): Promise<{ message: string }> {
    await this.getLodgingById(id);
    await this.lodgingRepository.delete(id);
    return { message: `Đã xóa nơi lưu trú ID ${id} thành công.` };
  }

  async uploadImages(
    lodgingId: number,
    files: Express.Multer.File[],
  ): Promise<LodgingImageDto[]> {
    await this.getLodgingById(lodgingId);

    const uploadedResults: LodgingImageDto[] = [];
    for (const file of files) {
      const imageUrl = await this.storageService.uploadFile(
        file,
        LODGING_BUCKET,
        `lodging-${lodgingId}`,
      );

      const savedImg = await this.lodgingRepository.addImage(lodgingId, imageUrl);
      uploadedResults.push({
        id: savedImg.id,
        imageUrl: savedImg.imageUrl,
      });
    }

    return uploadedResults;
  }

  async deleteImage(imageId: number): Promise<{ message: string }> {
    const image = await this.lodgingRepository.findImageById(imageId);
    if (!image) {
      throw new NotFoundException(`Không tìm thấy ảnh với ID ${imageId}`);
    }

    await this.storageService.deleteFileByUrl(image.imageUrl, LODGING_BUCKET);
    await this.lodgingRepository.deleteImage(imageId);

    return { message: `Đã xóa ảnh ID ${imageId} thành công.` };
  }
}
