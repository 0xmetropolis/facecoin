import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;

// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
neonConfig.poolQueryViaFetch = true;
// Type definitions

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export default (function () {
  if (typeof window !== "undefined")
    throw new Error("DO NOT USE PRISMA IN THE BROWSER");

  const connectionString = `${process.env.POSTGRES_PRISMA_URL}`;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  const prisma = global.prisma || new PrismaClient({ adapter });
  if (process.env.NODE_ENV === "development") global.prisma = prisma;

  return prisma;
})();
