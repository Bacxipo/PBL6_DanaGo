import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async getStatus() {
    return { status: 'ok', service: 'AuthModule' };
  }
}
