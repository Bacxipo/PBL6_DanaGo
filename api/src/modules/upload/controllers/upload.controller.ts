import {
    Controller,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    BadRequestException,
    Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from '../services/upload.service';
import type { UploadFolder } from '../services/upload.service';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post('image')
    @UseInterceptors(
        FileInterceptor('file', { storage: memoryStorage() }),
    )
    async uploadImage(
        @UploadedFile() file: any,
        @Query('folder') folder: UploadFolder = 'feed',
    ) {
        if (!file) {
            throw new BadRequestException('Không có file nào được gửi lên.');
        }
        const url = await this.uploadService.uploadImage(file, folder);
        return { url };
    }
}