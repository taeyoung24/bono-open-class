import { PrismaClient } from '@prisma/client'

// 개발 환경에서 핫 리로드 시 DB 연결이 무한 증식하는 것을 방지하는 패턴입니다.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
