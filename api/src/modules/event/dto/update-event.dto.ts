import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class UpdateEventDto {
  @IsString({ message: 'Tên sự kiện phải là chuỗi ký tự.' })
  @IsOptional()
  name?: string;

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
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ (YYYY-MM-DD).' })
  @IsOptional()
  endDate?: string;

  @IsNumber({}, { message: 'Giá vé phải là số.' })
  @IsOptional()
  ticketPrice?: number;
}
