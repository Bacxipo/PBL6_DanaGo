import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  fullName: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.replace(/[\s().-]/g, '')
      : value,
  )
  @IsString()
  @MaxLength(10)
  @ValidateIf((_object, value) => value !== '')
  @Matches(/^[0-9]{10}$/, {
    message: 'Số điện thoại phải gồm đúng 10 chữ số.',
  })
  phoneNumber: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(1000)
  bio: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  categoryIds?: number[];
}
