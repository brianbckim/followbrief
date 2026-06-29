import type { IncomingMessage } from "node:http";
import { prisma } from "../db/prisma";
import { getAIProvider } from "../ai/provider-factory";

export interface GraphQLContext {
  req?: IncomingMessage;
  prisma: typeof prisma;
  aiProvider: ReturnType<typeof getAIProvider>;
}

export function createGraphQLContext(req?: IncomingMessage): GraphQLContext {
  return {
    req,
    prisma,
    aiProvider: getAIProvider()
  };
}
