import { applyDecorators, UseGuards } from '@nestjs/common'
import { UserRole } from 'prisma/generated/client'

import { JwtAuthGuard, RolesGuard } from '@/modules/auth/guards'

import { Roles } from './roles.decorator'

export const Authorization = (...roles: UserRole[]) => {
  if (roles.length > 0) {
    return applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, RolesGuard))
  }

  return applyDecorators(UseGuards(JwtAuthGuard))
}
