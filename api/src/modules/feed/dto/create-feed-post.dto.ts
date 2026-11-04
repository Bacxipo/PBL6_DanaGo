import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ArrayMaxSize, IsEnum } from 'class-validator';
import { FeedPostType } from '@prisma/client';

import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDestinationProposalDto } from './create-destination-proposal.dto';

export class CreateFeedPostDto {
  @IsString({ message: 'Nội dung bài viết phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Nội dung bài viết không được để trống.' })
  content: string;

  @IsOptional()
  @IsEnum(FeedPostType, {
    message: 'Loại bài viết không hợp lệ.',
  })
  postType?: FeedPostType;

  @IsNumber({}, { message: 'Mã điểm đến (destinationId) phải là số.' })
  @IsOptional()
  destinationId?: number;

  @IsArray({ message: 'Danh sách hình ảnh phải là mảng.' })
  @ArrayMaxSize(5, { message: 'Chỉ được đăng tối đa 5 ảnh mỗi bài viết.' })
  @IsString({ each: true, message: 'Mỗi ảnh phải là đường dẫn URL hợp lệ.' })
  @IsOptional()
  images?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDestinationProposalDto)
  proposal?: CreateDestinationProposalDto;
}

export class CreateFeedCommentDto {
  @IsString({ message: 'Nội dung bình luận phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Nội dung bình luận không được để trống.' })
  content: string;
}
