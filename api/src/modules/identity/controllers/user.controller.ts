import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UserService } from '../services/user.service';
import { UserResponseDto } from '../dto/user-response.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserRoleDto, UpdateUserStatusDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('identity/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  list(): Promise<UserResponseDto[]> {
    return this.userService.listUsers();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.createUser(dto);
  }

  @Get(':id')
  getProfile(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.userService.getUserProfile(id);
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
