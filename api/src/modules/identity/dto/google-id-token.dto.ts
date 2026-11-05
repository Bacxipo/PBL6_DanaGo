import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class GoogleIdTokenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(16384)
  @Matches(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
  idToken: string;
}
