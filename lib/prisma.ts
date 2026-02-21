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
  } else {
    // Provide a dummy URL during Vercel build phase to prevent Prisma from crashing
    // when Next.js tries to collect page data/traces for dynamic routes.
    options.datasources = {
      db: {
        url: "postgresql://dummy:dummy@localhost:5432/postgres"
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
