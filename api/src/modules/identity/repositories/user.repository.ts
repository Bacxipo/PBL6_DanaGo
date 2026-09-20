import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  private mapToEntity(row: any): UserEntity {
    return {
      id: row.id,
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
