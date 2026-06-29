declare module "graphql-ws/use/ws" {
  import type { GraphQLSchema } from "graphql";
  import type { WebSocketServer } from "ws";

  export function useServer(
    options: {
      schema: GraphQLSchema;
      context?: (...args: any[]) => unknown | Promise<unknown>;
    },
    server: WebSocketServer
  ): {
    dispose: () => Promise<void>;
  };
}
