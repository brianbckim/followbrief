import fs from "node:fs";
import path from "node:path";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers } from "./resolvers";

const schemaPath = path.resolve(process.cwd(), "src/graphql/schema.graphql");

export const typeDefs = fs.readFileSync(schemaPath, "utf8");

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers: resolvers as any
});
