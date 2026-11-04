import { IsEnum, IsNotEmpty } from 'class-validator';
import { ContentStatus } from '@prisma/client';

export class UpdateReviewStatusDto {
  @IsNotEmpty({ message: 'Trạng thái kiểm duyệt không được để trống' })
  @IsEnum(ContentStatus, { message: 'Trạng thái phải là PENDING, APPROVED hoặc REJECTED' })
  status!: ContentStatus;
}

