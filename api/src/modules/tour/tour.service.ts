import { Injectable } from '@nestjs/common';

@Injectable()
export class TourService {
  async findAll() {
    return [
      { id: 'tour-1', title: 'Tour Bà Nà Hills 1 Ngày', price: 1250000, location: 'Đà Nẵng' },
      { id: 'tour-2', title: 'Tour Phố Cổ Hội An & Bán Đảo Sơn Trà', price: 650000, location: 'Quảng Nam' },
    ];
  }
}
