import { FactoryProvider, ModuleMetadata } from '@nestjs/common'

export type AsyncOptions = Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'useFactory' | 'inject'>
