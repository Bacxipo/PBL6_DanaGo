import {IsInt, IsNotEmpty, Min, Max, IsOptional, IsString, IsArray  } from "class-validator";
export class CreateReviewDto {
    @IsInt({message: 'Mã địa điểm phải là số nguyên.'})
    @IsNotEmpty({message: 'Mã địa điểm không được để trống.'})
    destinationId!: number;

    @IsInt({message: 'Điểm đánh giá phải là số nguyên.'})
    @Min(1, {message: 'Điểm đánh giá phải lớn hơn hoặc bằng 1.'})
    @Max(5, {message: 'Điểm đánh giá phải nhỏ hơn hoặc bằng 5.'})
    @IsNotEmpty({message: 'Điểm đánh giá không được để trống.'})
    rating!: number;

    @IsString({message: 'Nội dung đánh giá phải là chuỗi ký tự.'})
    @IsOptional()
    comment?: string;
    
    @IsArray({message: 'Danh sách hình ảnh phải là một mảng.'})
    @IsString({each: true, message: 'Mỗi hình ảnh phải là một chuỗi ký tự.'})
    @IsOptional()
    images?: string[];
}