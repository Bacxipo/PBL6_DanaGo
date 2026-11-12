import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class CreateChecklistDto {
  @IsOptional()
  @IsNumber()
  itineraryItemId?: number;

  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsOptional()
  @IsBoolean()
  isChecked?: boolean;
}

export class UpdateChecklistDto {
  @IsOptional()
  @IsString()
  itemName?: string;

  @IsOptional()
  @IsBoolean()
  isChecked?: boolean;
}

export class SaveFullItineraryDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImg?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsObject()
  days?: Record<string, any[]>;
}
