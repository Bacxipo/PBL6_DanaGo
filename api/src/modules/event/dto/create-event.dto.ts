import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsArray } from 'class-validator';

export class CreateEventDto {
  @IsString({ message: 'Tên sự kiện phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Tên sự kiện không được để trống.' })
  name: string;

  @IsString({ message: 'Mô tả phải là chuỗi ký tự.' })
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'Mã điểm đến (destinationId) phải là số.' })
  @IsOptional()
  destinationId?: number;

  @IsString({ message: 'Ghi chú địa điểm phải là chuỗi ký tự.' })
  @IsOptional()
  locationNote?: string;

  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ (YYYY-MM-DD).' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống.' })
  startDate: string;

  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ (YYYY-MM-DD).' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống.' })
  endDate: string;

  @IsNumber({}, { message: 'Giá vé phải là số.' })
  @IsOptional()
  ticketPrice?: number;

  @IsArray({ message: 'Danh sách hình ảnh phải là mảng.' })
  @IsOptional()
  images?: string[];
}
