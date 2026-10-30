import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UploadController } from './controllers/upload.controller';
import { UploadService } from './services/upload.service';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'danago_secret_key_change_in_production',
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [UploadController],
    providers: [UploadService],
    exports: [UploadService],
})
export class UploadModule { }