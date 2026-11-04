import{ IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
export class UpdateReviewDto {
    @IsInt ({message: 'Điểm đánh giá phải là số nguyên.'})
    @Min(1, {message: 'Điểm đánh giá phải lớn hơn hoặc bằng 1.'})
    @Max(5, {message: 'Điểm đánh giá phải nhỏ hơn hoặc bằng 5.'})
    @IsOptional()
    rating?: number;

    @IsString({message: 'Nội dung đánh giá phải là chuỗi ký tự.'})
    @IsOptional()
    comment?: string;

    @IsArray({message: 'Danh sách hình ảnh phải là một mảng.'})
    @IsString({each: true, message: 'Mỗi hình ảnh phải là một chuỗi ký tự.'})
    @IsOptional()
    images?: string[];
}