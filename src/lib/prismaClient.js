import { DATABASE_URL } from "../config/env.config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      // url: DATABASE_URL || 'postgresql://JobBoard_owner:npg_bi6JclUBxu7H@ep-fragrant-cell-a84kg3ny-pooler.eastus2.azure.neon.tech/JobBoard?sslmode=require'
      url: DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
