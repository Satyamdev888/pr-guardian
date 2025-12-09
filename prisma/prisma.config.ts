// prisma.config.ts
import { defineConfig } from "@prisma/config";

/**
 * Get an environment variable and throw a clear error if it's missing.
 * This both satisfies TypeScript (returns string) and fails fast at runtime
 * if you forgot to set the variable.
 */
function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Environment variable ${name} is required but was not provided.`);
  }
  return v;
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: getEnv("DATABASE_URL"), // e.g. "file:./dev.db"
    // shadowDatabaseUrl: getEnv("SHADOW_DATABASE_URL"), // optional if you need a shadow DB
  },
});
