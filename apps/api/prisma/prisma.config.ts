import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

export default defineConfig({
  adapter: () => new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
