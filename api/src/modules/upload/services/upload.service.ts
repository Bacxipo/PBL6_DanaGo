import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type UploadFolder = 'feed' | 'review' | 'event' | 'avatar';

@Injectable()
export class UploadService {
    private supabase: SupabaseClient;
    private bucket: string;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_KEY!,
        );
        this.bucket = process.env.SUPABASE_BUCKET || 'destination_image';
    }

    async uploadImage(
        file: Express.Multer.File,
        folder: UploadFolder = 'feed',
    ): Promise<string> {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException('Chỉ hỗ trợ ảnh JPG, PNG, WebP.');
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new BadRequestException('Ảnh không được vượt quá 5MB.');
        }

        const ext = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = `${folder}/${fileName}`;

        const { error } = await this.supabase.storage
            .from(this.bucket)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            console.dir(error, { depth: 6 });

            throw new BadRequestException(
                'Upload ảnh thất bại: ' + error.message,
            );
        }

        const { data } = this.supabase.storage
            .from(this.bucket)
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
}