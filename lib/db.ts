type PrismaClientLike = any;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientLike;
};

function createPrismaClient(): PrismaClientLike {
  try {
    // Prisma Client only exposes PrismaClient after `prisma generate` has run.
    // Keeping this dynamic avoids build-time type failures before generation.
    const prismaClientPackage = require('@prisma/client') as { PrismaClient?: new (options?: unknown) => PrismaClientLike };

    if (!prismaClientPackage.PrismaClient) {
      throw new Error('PrismaClient export is missing. Run npm run db:generate first.');
    }

    return new prismaClientPackage.PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Prisma Client error';

    return new Proxy(
      {},
      {
        get() {
          throw new Error(`Prisma Client is not ready: ${message}`);
        }
      }
    );
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
