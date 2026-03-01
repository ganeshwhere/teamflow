import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import type { VerifyTokenPayload } from "@repo/types";

export class VerifyTokenDto implements VerifyTokenPayload {
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
