import { IsIn } from 'class-validator';
import { ContentStatus } from '@prisma/client';

export class ModerateFeedPostDto {
    @IsIn(
        [ContentStatus.APPROVED, ContentStatus.REJECTED],
        {
            message: 'Trạng thái phải là APPROVED hoặc REJECTED.',
        },
    )
    status: ContentStatus;
}