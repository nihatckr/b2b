
import { PrismaClient } from './generated/prisma'
import { getUserId } from './utils/user-role-helper'

const prisma = new PrismaClient()

export interface Context {
  prisma: typeof prisma
  req: any // HTTP request carrying the `Authorization` header
  userId?: number | null
}

export function createContext({ req }: { req: any }) {
  return {
    req,
    prisma,
    userId: getUserId({ req, prisma })
  }
}
