
import { PrismaClient } from './data/generated/prisma'

const prisma = new PrismaClient()

export interface Context {
  prisma: typeof prisma
  req: any // HTTP request carrying the `Authorization` header
}

export function createContext({ req }: { req: any }) {
  return {
    req,
    prisma,
  }
}
