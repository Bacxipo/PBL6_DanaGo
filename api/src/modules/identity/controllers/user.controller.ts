import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserResponseDto } from '../dto/user-response.dto';

@Controller('identity/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.getUserProfile(+id);
  }
}
