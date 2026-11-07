import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  async getPreferences(userId: number) {
    return this.prisma.userPreference.findMany({ where: { userId }, select: { categoryId: true } });
  }

  async findPreferenceCategories(categoryIds: number[]) {
    return this.prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true } });
  }

  async savePreferences(userId: number, categoryIds: number[]) {
    await this.prisma.$transaction([
      this.prisma.userPreference.deleteMany({ where: { userId } }),
      this.prisma.userPreference.createMany({ data: categoryIds.map((categoryId) => ({ userId, categoryId })) }),
    ]);
    return { categoryIds };
  }
  constructor(private readonly prisma: PrismaService) {}

  async findBySupabaseId(supabaseId: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { supabaseId } });
    return user ? this.mapToEntity(user) : null;
  }

  async findById(id: number): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.mapToEntity(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.mapToEntity(user);
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) return null;
    return this.mapToEntity(user);
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });
    if (!user) return null;
    return this.mapToEntity(user);
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const created = await this.prisma.user.create({
      data: {
        supabaseId: data.supabaseId,
        username: data.username!,
        fullName: data.fullName!,
        email: data.email!,
        passwordHash: data.passwordHash!,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
        role: (data.role as any) || 'USER',
        status: (data.status as any) || 'ACTIVE',
      },
    });
    return this.mapToEntity(created);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map((u) => this.mapToEntity(u));
  }

  async update(id: number, data: { status?: UserStatus; role?: UserRole }): Promise<UserEntity> {
    const updated = await this.prisma.user.update({ where: { id }, data });
    return this.mapToEntity(updated);
  }

  private mapToEntity(row: any): UserEntity {
    return {
      id: row.id,
      supabaseId: row.supabaseId,
      username: row.username,
      fullName: row.fullName,
      email: row.email,
      passwordHash: row.passwordHash,
      avatarUrl: row.avatarUrl,
      bio: row.bio,
      role: row.role,
      status: row.status,
      createdAt: new Date(row.createdAt),
    };
  }
}
