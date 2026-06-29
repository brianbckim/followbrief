import path from "node:path";
import { config } from "dotenv";

config({ path: path.resolve(process.cwd(), "../../.env") });
config();

export const env = {
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://followbrief:followbrief@localhost:5432/followbrief",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  graphqlPort: Number(process.env.GRAPHQL_PORT ?? 4000),
  aiProvider: process.env.AI_PROVIDER ?? "mock",
  aiBaseUrl: process.env.AI_BASE_URL ?? "http://localhost:8080/v1",
  aiModel: process.env.AI_MODEL ?? "qwen-local",
  aiApiKey: process.env.AI_API_KEY ?? "local"
};

process.env.DATABASE_URL = env.databaseUrl;
