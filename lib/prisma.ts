import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

const initialDatabaseProcedures = async () => {
  try {
    const category = await prisma.categories.findUnique({ where: { name: "General" } });
    if (!category) {
      await prisma.categories.create({
        data: {
          name: "General",
        },
      });
    }
  } catch (error) {
    console.error("Couldn't initialize category data", error);
  }
};

(async () => {
  await initialDatabaseProcedures();
})();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
