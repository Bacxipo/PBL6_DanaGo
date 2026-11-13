import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateLodgingStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'], {
    message: 'Trạng thái phải là PENDING, APPROVED hoặc REJECTED.',
  })
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
