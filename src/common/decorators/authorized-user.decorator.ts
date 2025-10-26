import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { User } from 'prisma/generated/client'

export const AuthorizedUser = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user as User

    return data ? user[data] : user
  },
)
