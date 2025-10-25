import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { User } from 'prisma/generated/client'

import { Authorization, AuthorizedUser } from '@/shared/decorators'

import { UserService } from './user.service'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Authorization()
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@AuthorizedUser() user: User) {
    const { password, ...profile } = user

    return profile
  }
}
