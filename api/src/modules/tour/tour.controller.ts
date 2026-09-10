import { Controller, Get } from '@nestjs/common';
import { TourService } from './tour.service';

@Controller('tours')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Get()
  getAllTours() {
    return this.tourService.findAll();
  }
}
