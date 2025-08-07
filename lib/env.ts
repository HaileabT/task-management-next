import { configDotenv } from "dotenv";
configDotenv();

export const env = {
  databaseUrl: process.env.DATABASE_URL || "postgresql://user:password@host:port/db",
  jwtSecret: process.env.JWT_SECRET || "super-secrect-key-or-something-idk",
};
