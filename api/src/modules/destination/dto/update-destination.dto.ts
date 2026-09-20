import { IsString, IsOptional, IsNumber, IsUrl } from 'class-validator';

export class UpdateDestinationDto {
  @IsString({ message: 'Tên địa điểm phải là chuỗi ký tự.' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Mô tả phải là chuỗi ký tự.' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'Quận/Huyện phải là chuỗi ký tự.' })
  @IsOptional()
  district?: string;

  @IsNumber({}, { message: 'Vĩ độ (latitude) phải là số.' })
  @IsOptional()
  latitude?: number;

  @IsNumber({}, { message: 'Kinh độ (longitude) phải là số.' })
  @IsOptional()
  longitude?: number;

  @IsUrl({}, { message: 'Địa chỉ đường dẫn Google Map/URL không hợp lệ.' })
  @IsOptional()
  addressUrl?: string;

  @IsNumber({}, { message: 'Mã danh mục (categoryId) phải là số.' })
  @IsOptional()
  categoryId?: number;

  @IsString({ message: 'Giá vé (ticketPrice) phải là chuỗi ký tự.' })
  @IsOptional()
  ticketPrice?: string;

  @IsString({ message: 'Giờ mở cửa (openHours) phải là chuỗi ký tự.' })
  @IsOptional()
  openHours?: string;
}
