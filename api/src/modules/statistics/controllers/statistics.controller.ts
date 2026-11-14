import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { StatisticsService } from '../services/statistics.service';
import { TrendsResponseDto } from '../dto/trends-response.dto';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  // Số liệu cho trang "Thống kê & Báo cáo" của WebAdmin
  @Get('trends')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Thống kê xu hướng du lịch trong N ngày gần nhất (mặc định 180, tối đa 730)' })
  getTrends(@Query('days', new DefaultValuePipe(180), ParseIntPipe) days: number): Promise<TrendsResponseDto> {
    return this.statisticsService.getTrends(days);
  }
}
