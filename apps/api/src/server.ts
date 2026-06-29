import http from "node:http";
import cors from "cors";
import { createYoga } from "graphql-yoga";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { schema } from "./graphql/executable-schema";
import { createGraphQLContext } from "./graphql/context";
import { env } from "./env";
import { logger } from "./logger/logger";

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
  context: ({ request }) => {
    const nodeRequest = "raw" in request ? (request.raw as http.IncomingMessage) : undefined;
    return createGraphQLContext(nodeRequest);
  },
  cors: {
    origin: "*",
    credentials: false
  }
});

const server = http.createServer((req, res) => {
  cors()(req, res, () => {
    yoga(req, res);
  });
});

const wsServer = new WebSocketServer({
  server,
  path: "/graphql"
});

useServer(
  {
    schema,
    context: () => createGraphQLContext()
  },
  wsServer
);

server.listen(env.graphqlPort, () => {
  logger.info(`FollowBrief GraphQL API ready at http://localhost:${env.graphqlPort}/graphql`);
});
