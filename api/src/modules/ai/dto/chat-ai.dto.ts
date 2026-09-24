import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class SendChatMessageDto {
  @IsNumber({}, { message: 'Mã phiên chat (sessionId) phải là số.' })
  @IsOptional()
  sessionId?: number;

  @IsString({ message: 'Nội dung tin nhắn phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống.' })
  message: string;
}

export class GenerateItineraryAiDto {
  @IsString({ message: 'Sở thích/yêu cầu không được để trống.' })
  @IsNotEmpty({ message: 'Vui lòng nhập sở thích hoặc yêu cầu chuyến đi.' })
  prompt: string;

  @IsNumber({}, { message: 'Số ngày phải là số.' })
  @IsOptional()
  days?: number;
}
