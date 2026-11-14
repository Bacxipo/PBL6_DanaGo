import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(16384)
  accessToken: string;
}
export class LinkGoogleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(16384)
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  password: string;
}