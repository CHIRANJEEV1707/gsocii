import { PrismaClient } from '@prisma/client'
import { env } from './env'

const prismaClientSingleton = () => {
  const options: any = {}

  if (env.DATABASE_URL) {
    options.datasources = {
      db: {
        url: env.DATABASE_URL
      }
    }
  }

  return new PrismaClient(options)
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
