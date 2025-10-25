import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { hash } from 'argon2'

import { PrismaService } from '@/infra/prisma/prisma.service'

import { CreateUserRequest, UpdateUserRequest } from './dto'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserRequest) {
    const { password, ...rest } = dto

    return this.prisma.user.create({
      data: {
        password: password ? await hash(password) : undefined,
        ...rest,
      },
      include: { accounts: true },
    })
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { accounts: true },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    })

    return user
  }

  async update(id: string, dto: UpdateUserRequest) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: dto,
      })
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundException('User not found')
      }

      throw err
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.user.delete({ where: { id } })
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundException('User not found')
      }

      throw err
    }
  }
}
