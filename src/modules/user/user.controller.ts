import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common'
import { User, UserRole } from 'prisma/generated/client'

import { Authorization, AuthorizedUser } from '@/common/decorators'

import { UserService } from './user.service'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Authorization()
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@AuthorizedUser('id') userId: string) {
    return this.userService.getProfile(userId)
  }

  @Authorization(UserRole.ADMIN)
  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') userId: string) {
    return this.userService.getProfile(userId)
  }
}
