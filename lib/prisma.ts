import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// Connection-level errors (can't reach DB / timeout / pool timeout).
// Retrying is safe here because the query never reached the database.
const RETRYABLE_CODES = new Set(["P1001", "P1002", "P1017", "P2024"]);
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 1000;

function createPrismaClient() {
  const client = new PrismaClient();
  return client.$extends({
    query: {
      $allOperations({ args, query }) {
        let attempts = 0;
        const run = async () => {
          try {
            return await query(args);
          } catch (error) {
            const code = (error as { code?: string })?.code;
            attempts += 1;
            if (
              code !== undefined &&
              RETRYABLE_CODES.has(code) &&
              attempts <= MAX_RETRIES
            ) {
              await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempts));
              return run();
            }
            throw error;
          }
        };
        return run();
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
