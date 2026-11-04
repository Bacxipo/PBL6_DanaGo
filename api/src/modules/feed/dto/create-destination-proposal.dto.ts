import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    Min,
    Matches
} from 'class-validator';

export class CreateDestinationProposalDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    district: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    categoryId?: number;

    @IsOptional()
    @IsUrl()
    @MaxLength(4096)
    addressUrl?: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    ticketPrice?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    @Matches(
        /^([01]\d|2[0-3]):[0-5]\d - ([01]\d|2[0-3]):[0-5]\d$/,
        { message: 'Giờ phải có dạng HH:mm - HH:mm.' },
    )
    openHours?: string;
}