import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from 'prisma/generated/client'

import { ROLES_KEY } from '@/common/decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    const request = context.switchToHttp().getRequest()

    if (!roles) {
      return true
    }

    if (!roles.includes(request.user.role)) {
      throw new ForbiddenException('You do not have permission to access this resource')
    }

    return true
  }
}
