import { GoogleLoginDto } from '../dto/google-login.dto';
import { GoogleIdTokenDto } from '../dto/google-id-token.dto';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';

@Controller('identity/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('google/mobile')
  @HttpCode(HttpStatus.OK)
  async googleMobile(@Body() dto: GoogleIdTokenDto): Promise<AuthResponseDto> {
    return this.authService.loginWithGoogleIdToken(dto.idToken);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async google(@Body() dto: GoogleLoginDto): Promise<AuthResponseDto> {
    return this.authService.loginWithGoogle(dto.accessToken);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }
}
