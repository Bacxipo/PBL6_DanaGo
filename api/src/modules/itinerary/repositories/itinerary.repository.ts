import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateChecklistDto, UpdateChecklistDto, SaveFullItineraryDto } from '../dto/checklist.dto';

@Injectable()
export class ItineraryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: number) {
    return this.prisma.itinerary.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            destination: true,
            checklists: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    return this.prisma.itinerary.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            destination: true,
            checklists: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  async getAllChecklists() {
    return this.prisma.checklistItem.findMany({
      include: {
        itineraryItem: {
          include: {
            destination: { select: { id: true, name: true } },
            itinerary: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async findChecklistsByItinerary(itineraryId: number) {
    return this.prisma.checklistItem.findMany({
      where: {
        itineraryItem: {
          itineraryId,
        },
      },
      include: {
        itineraryItem: {
          include: {
            destination: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async findChecklistsByItem(itineraryItemId: number) {
    return this.prisma.checklistItem.findMany({
      where: { itineraryItemId },
      orderBy: { id: 'asc' },
    });
  }

  async createChecklistItem(itineraryItemId: number, itemName: string, isChecked = false) {
    return this.prisma.checklistItem.create({
      data: {
        itineraryItemId,
        itemName,
        isChecked,
      },
    });
  }

  async updateChecklistItem(id: number, data: UpdateChecklistDto) {
    return this.prisma.checklistItem.update({
      where: { id },
      data: {
        ...(data.itemName !== undefined && { itemName: data.itemName }),
        ...(data.isChecked !== undefined && { isChecked: data.isChecked }),
      },
    });
  }

  async deleteChecklistItem(id: number) {
    return this.prisma.checklistItem.delete({
      where: { id },
    });
  }

  /**
   * Lưu toàn bộ lịch trình cùng danh sách hoạt động và checklist items vào Database
   */
  async saveFullItinerary(dto: SaveFullItineraryDto) {
    // 1. Xác định user hợp lệ
    let userId = dto.userId;
    if (!userId) {
      const defaultUser = await this.prisma.user.findFirst();
      userId = defaultUser ? defaultUser.id : 1;
    }

    // 2. Lấy một destinationId mặc định đề phòng custom activities không có placeId
    const fallbackDest = await this.prisma.destination.findFirst({ select: { id: true } });
    const fallbackDestId = fallbackDest ? fallbackDest.id : 1;

    // 3. Tạo hoặc cập nhật Itinerary
    let itineraryId = dto.id && !isNaN(Number(dto.id)) ? Number(dto.id) : null;
    let itinerary;

    if (itineraryId) {
      const existing = await this.prisma.itinerary.findUnique({ where: { id: itineraryId } });
      if (existing) {
        itinerary = await this.prisma.itinerary.update({
          where: { id: itineraryId },
          data: {
            title: dto.title,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            budget: dto.budget ? Number(dto.budget) : 0,
          },
        });
        // Xóa các items cũ để làm mới cấu trúc
        await this.prisma.itineraryItem.deleteMany({
          where: { itineraryId },
        });
      }
    }

    if (!itinerary) {
      itinerary = await this.prisma.itinerary.create({
        data: {
          userId,
          title: dto.title,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          budget: dto.budget ? Number(dto.budget) : 0,
        },
      });
      itineraryId = itinerary.id;
    }

    // 4. Duyệt qua từng ngày và từng hoạt động để tạo itineraryItem và checklistItem
    if (dto.days && typeof dto.days === 'object') {
      for (const [dayKey, activities] of Object.entries(dto.days)) {
        const dayIndex = parseInt(dayKey, 10) || 1;
        if (Array.isArray(activities)) {
          for (let orderIndex = 0; orderIndex < activities.length; orderIndex++) {
            const act = activities[orderIndex];
            const destId = act.placeId || act.destinationId || fallbackDestId;

            // Kiểm tra xem destinationId có tồn tại không
            const destExists = await this.prisma.destination.findUnique({
              where: { id: Number(destId) },
              select: { id: true },
            });
            const validDestId = destExists ? destExists.id : fallbackDestId;

            const createdItem = await this.prisma.itineraryItem.create({
              data: {
                itineraryId: itinerary.id,
                destinationId: validDestId,
                dayIndex: dayIndex,
                orderIndex: orderIndex,
                budget: act.budget ? Number(act.budget) : 0,
              },
            });

            // Gán các checklist items nếu có
            if (Array.isArray(act.checklists) && act.checklists.length > 0) {
              for (const chk of act.checklists) {
                if (chk && chk.itemName && chk.itemName.trim()) {
                  await this.prisma.checklistItem.create({
                    data: {
                      itineraryItemId: createdItem.id,
                      itemName: chk.itemName.trim(),
                      isChecked: Boolean(chk.isChecked),
                    },
                  });
                }
              }
            }
          }
        }
      }
    }

    // Trả về itinerary kèm các items và checklists vừa tạo
    return this.prisma.itinerary.findUnique({
      where: { id: itinerary.id },
      include: {
        items: {
          include: {
            destination: true,
            checklists: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }
}
