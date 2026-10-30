import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { UserService } from '../services/user.service';
import { UserResponseDto } from '../dto/user-response.dto';

@Controller('identity/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@CurrentUser('sub') userId: number): Promise<UserResponseDto> {
    return this.userService.getUserProfile(userId);
  }

  @Get(':id')
  async getProfile(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.getUserProfile(+id);
  }
}
