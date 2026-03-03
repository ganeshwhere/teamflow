import { IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { AUTH_PROVIDERS, type VerifyTokenPayload } from "@repo/types";

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
  @IsIn(AUTH_PROVIDERS)
  provider!: VerifyTokenPayload["provider"];

  @IsString()
  providerId!: string;
}
