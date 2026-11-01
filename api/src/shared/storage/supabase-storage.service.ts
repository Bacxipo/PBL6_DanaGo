import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://jmwoffnpyqqglvvzgzah.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

    if (!supabaseKey) {
      this.logger.warn('SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình trong .env. Việc upload ảnh có thể gặp lỗi!');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }

  /**
   * Upload 1 file lên Supabase Storage bucket
   * @param file File nhận được từ Multer
   * @param bucket Tên bucket (mặc định 'destinations')
   * @param folder Thư mục con trong bucket (ví dụ 'destinations/123')
   * @returns Public URL của file đã upload
   */
  async uploadFile(
    file: Express.Multer.File,
    bucket = process.env.SUPABASE_BUCKET_DESTINATIONS || 'destination_image',
    folder = '',
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh để tải lên.');
    }

    // Kiểm tra định dạng ảnh
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Định dạng file không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP, GIF.');
    }

    // Tạo tên file unique để tránh trùng lặp
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e6)}-${cleanOriginalName}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Lỗi khi tải file lên Supabase Storage: ${error.message}`, error);
      throw new InternalServerErrorException(`Không thể tải ảnh lên: ${error.message}`);
    }

    // Lấy Public URL của ảnh
    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  /**
   * Xóa file khỏi Supabase Storage dựa trên Public URL
   * @param fileUrl URL công khai của file
   * @param bucket Tên bucket chứa file
   */
  async deleteFileByUrl(
    fileUrl: string,
    bucket = process.env.SUPABASE_BUCKET_DESTINATIONS || 'destination_image',
  ): Promise<boolean> {
    try {
      const urlParts = fileUrl.split(`${bucket}/`);
      if (urlParts.length < 2) return false;

      const filePath = decodeURIComponent(urlParts[1]);
      const { error } = await this.supabase.storage.from(bucket).remove([filePath]);

      if (error) {
        this.logger.error(`Lỗi khi xóa file ${filePath}: ${error.message}`);
        return false;
      }
      return true;
    } catch (err) {
      this.logger.error(`Lỗi ngoại lệ khi xóa file: ${err.message}`);
      return false;
    }
  }
}
