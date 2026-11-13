import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';
import { FavoriteEntity } from '../entities/favorite.entity';

@Injectable()
export class FavoriteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUserId(userId: number): Promise<FavoriteEntity[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId, destination: { status: ContentStatus.APPROVED } },
      include: { destination: { include: { images: true, category: true } } },
      orderBy: [{ createdAt: 'desc' }, { destinationId: 'desc' }],
    });

    return favorites.map((favorite) => ({
      ...favorite,
      destination: {
        ...favorite.destination,
        categoryName: favorite.destination.category?.name,
      },
    }));
  }

  async findApprovedDestination(destinationId: number) {
    return this.prisma.destination.findFirst({
      where: { id: destinationId, status: ContentStatus.APPROVED },
      select: { id: true },
    });
  }

  async add(userId: number, destinationId: number): Promise<void> {
    await this.prisma.favorite.upsert({
      where: { userId_destinationId: { userId, destinationId } },
      create: { userId, destinationId },
      update: {},
    });
  }

  async remove(userId: number, destinationId: number): Promise<void> {
    await this.prisma.favorite.deleteMany({ where: { userId, destinationId } });
  }
}
