import {
    IsNotEmpty,
    IsString,
    Matches,
} from 'class-validator';

export class UpdateFeedPostDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/\S/, {
        message: 'Nội dung không được chỉ chứa khoảng trắng.',
    })
    content: string;
}