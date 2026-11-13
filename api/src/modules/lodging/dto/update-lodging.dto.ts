import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLodgingDto {
  @IsString({ message: 'Tên nơi lưu trú phải là chuỗi ký tự.' })
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString({ message: 'Loại nơi lưu trú phải là chuỗi ký tự.' })
  @IsOptional()
  type?: string;

  @IsString({ message: 'Quận/Huyện phải là chuỗi ký tự.' })
  @IsOptional()
  district?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Vĩ độ (latitude) phải là số.' })
  @IsOptional()
  latitude?: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Kinh độ (longitude) phải là số.' })
  @IsOptional()
  longitude?: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Giá phòng mỗi đêm (pricePerNight) phải là số.' })
  @Min(0)
  @IsOptional()
  pricePerNight?: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Sức chứa tối đa (maxGuests) phải là số.' })
  @Min(1)
  @Max(50)
  @IsOptional()
  maxGuests?: number;

  @IsString()
  @IsOptional()
  checkin?: string;

  @IsString()
  @IsOptional()
  checkout?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  avgRating?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(4096)
  addressUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  website?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsArray()
  @IsOptional()
  amenityIds?: number[];

  @IsArray()
  @IsOptional()
  amenities?: string[];
}
