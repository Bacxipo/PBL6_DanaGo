import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateFeedPostDto {
  @IsString({ message: 'Nội dung bài viết phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Nội dung bài viết không được để trống.' })
  content: string;

  @IsNumber({}, { message: 'Mã điểm đến (destinationId) phải là số.' })
  @IsOptional()
  destinationId?: number;

  @IsArray({ message: 'Danh sách hình ảnh phải là mảng.' })
  @IsOptional()
  images?: string[];
}

export class CreateFeedCommentDto {
  @IsString({ message: 'Nội dung bình luận phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Nội dung bình luận không được để trống.' })
  content: string;
}
