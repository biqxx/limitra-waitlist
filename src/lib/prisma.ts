import { PrismaClient } from '@/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma_latest?: PrismaClient };

export function getPrisma() {
  if (globalForPrisma.prisma_latest) {
    return globalForPrisma.prisma_latest;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  const databaseSslEnabled = process.env.DATABASE_SSL === 'true';
  const configuredPoolMax = Number.parseInt(
    process.env.DATABASE_POOL_MAX ?? '10',
    10
  );
  const poolMax = Number.isFinite(configuredPoolMax) ? configuredPoolMax : 10;
  const pool = new Pool({
    connectionString,
    max: poolMax,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    ssl: databaseSslEnabled
      ? {
          rejectUnauthorized:
            process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
        }
      : undefined,
  });
  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
    log: ['error'],
  });

  globalForPrisma.prisma_latest = prisma;
  return prisma;
}
