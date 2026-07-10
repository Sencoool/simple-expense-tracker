import { PrismaClient } from "../app/generated/prisma";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// ✅ ลบ withAccelerate() ออกแล้ว เนื่องจากเปลี่ยนมาใช้ PostgreSQL บน Docker โดยตรง
// (withAccelerate เป็น extension สำหรับ Prisma Accelerate / NEON เท่านั้น)
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
