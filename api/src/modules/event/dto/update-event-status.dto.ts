import { IsEnum, IsNotEmpty } from 'class-validator';
import { ContentStatus } from '@prisma/client';

export class UpdateEventStatusDto {
  @IsEnum(ContentStatus, { message: 'Trạng thái phải là APPROVED hoặc REJECTED.' })
  @IsNotEmpty({ message: 'Trạng thái không được để trống.' })
  status: ContentStatus;
}
