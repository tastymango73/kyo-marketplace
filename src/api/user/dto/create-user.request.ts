import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator'
import { AuthMethod } from 'prisma/generated/client'

export class CreateUserRequest {
  @IsString()
  @IsNotEmpty()
  @Length(3, 32)
  name: string

  @IsEmail()
  email: string

  @IsString()
  @IsOptional()
  @Length(6, 128)
  password?: string

  @IsString()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string

  @IsEnum(AuthMethod)
  @IsNotEmpty()
  method: AuthMethod

  @IsBoolean()
  @IsNotEmpty()
  isVerified: boolean
}
