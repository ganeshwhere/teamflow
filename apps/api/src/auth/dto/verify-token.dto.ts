import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class VerifyTokenDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsString()
  provider!: string;

  @IsString()
  providerId!: string;
}
