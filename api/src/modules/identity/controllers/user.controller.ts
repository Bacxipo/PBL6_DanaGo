import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { UserService } from '../services/user.service';
import { UserResponseDto } from '../dto/user-response.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserRoleDto, UpdateUserStatusDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Controller('identity/users')
export class UserController {
  @Get('me/preferences')
  @UseGuards(JwtAuthGuard)
  getPreferences(@CurrentUser('sub') userId: number) {
    return this.userService.getPreferences(userId);
  }

  @Patch('me/preferences')
  @UseGuards(JwtAuthGuard)
  updatePreferences(@CurrentUser('sub') userId: number, @Body() dto: UpdatePreferencesDto) {
    return this.userService.updatePreferences(userId, dto.categoryIds);
  }
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@CurrentUser('sub') userId: number): Promise<UserResponseDto> {
    return this.userService.getUserProfile(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  list(): Promise<UserResponseDto[]> {
    return this.userService.listUsers();
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMyProfile(@CurrentUser('sub') userId: number, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(userId, dto);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  changeMyPassword(@CurrentUser('sub') userId: number, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(userId, dto);
  }

  @Patch('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
        return callback(new BadRequestException('Ảnh phải là JPG, PNG hoặc WebP.'), false);
      }
      callback(null, true);
    },
  }))
  updateMyAvatar(@CurrentUser('sub') userId: number, @UploadedFile() file: Express.Multer.File) {
    return this.userService.updateAvatar(userId, file);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.createUser(dto);
  }

  @Get(':id')
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.getPublicProfile(id);
  }

  @Get(':id/public')
  async getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getUserProfile(id);
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      authProvider: user.authProvider,
      bio: user.bio,
    };
  }

  // Token ký với { sub, username, role } nên lấy mã người dùng từ 'sub'
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserStatusDto, @CurrentUser('sub') currentUserId: number): Promise<UserResponseDto> {
    return this.userService.updateStatus(id, dto, currentUserId);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserRoleDto, @CurrentUser('sub') currentUserId: number): Promise<UserResponseDto> {
    return this.userService.updateRole(id, dto, currentUserId);
  }
}
