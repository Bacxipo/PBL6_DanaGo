import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        // Không có token → vẫn cho qua (khác với JwtAuthGuard)
        if (!authHeader || !authHeader.startsWith('Bearer ')) return true;

        try {
            const token = authHeader.split(' ')[1];
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET || 'danago_secret_key_change_in_production',
            });
            request.user = payload; // Gắn user nếu có token hợp lệ
        } catch {
            // Token lỗi → vẫn cho qua (không throw)
        }
        return true;
    }
}