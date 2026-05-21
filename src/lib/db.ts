// Prisma client singleton (lazy-loaded).
//
// To enable persistence:
//   1. npm install @prisma/client prisma
//   2. Set DATABASE_URL in .env.local
//   3. npx prisma generate && npx prisma migrate dev --name init
//
// Until then, getPrisma() throws — but the build still succeeds because the
// import is dynamic and resolution failures are caught.

type PrismaClientLike = unknown;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientLike;
};

export async function getPrisma(): Promise<PrismaClientLike> {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  type PrismaModule = { PrismaClient: new () => PrismaClientLike };
  // Dynamic + indirect specifier prevents bundlers / TS from resolving the
  // package at build time when it isn't installed yet.
  const specifier = "@prisma/client";
  const mod = (await import(/* webpackIgnore: true */ specifier).catch(
    () => null,
  )) as PrismaModule | null;

  if (!mod || typeof mod.PrismaClient !== "function") {
    throw new Error(
      "@prisma/client is not installed. Run `npm install @prisma/client prisma` and `npx prisma generate`.",
    );
  }
  const client = new mod.PrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}
