import Redis from "ioredis";
import type { WorkflowRunEvent } from "@prisma/client";
import { env } from "../env";
import { logger } from "../logger/logger";

function channelForRun(runId: string) {
  return `workflow-run:${runId}`;
}

const publisher = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

export async function publishWorkflowEvent(event: WorkflowRunEvent) {
  try {
    await publisher.publish(channelForRun(event.workflowRunId), JSON.stringify(event));
  } catch (error) {
    logger.warn({ error }, "Failed to publish workflow event");
  }
}

export function closePubSub() {
  publisher.disconnect();
}

export function subscribeWorkflowEvents(runId: string): AsyncIterable<WorkflowRunEvent> {
  const subscriber = new Redis(env.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });
  const channel = channelForRun(runId);
  const queue: WorkflowRunEvent[] = [];
  const waiting: Array<(value: IteratorResult<WorkflowRunEvent>) => void> = [];
  let closed = false;

  const push = (event: WorkflowRunEvent) => {
    const resolver = waiting.shift();
    if (resolver) {
      resolver({ value: event, done: false });
    } else {
      queue.push(event);
    }
  };

  subscriber.subscribe(channel).catch((error) => {
    logger.warn({ error, runId }, "Failed to subscribe to workflow events");
  });

  subscriber.on("message", (_channel, message) => {
    try {
      push(JSON.parse(message) as WorkflowRunEvent);
    } catch (error) {
      logger.warn({ error }, "Failed to parse workflow event");
    }
  });

  return {
    [Symbol.asyncIterator]() {
      return {
        next() {
          if (queue.length > 0) {
            return Promise.resolve({ value: queue.shift()!, done: false });
          }

          if (closed) {
            return Promise.resolve({ value: undefined, done: true });
          }

          return new Promise<IteratorResult<WorkflowRunEvent>>((resolve) => {
            waiting.push(resolve);
          });
        },
        async return() {
          closed = true;
          waiting.splice(0).forEach((resolve) =>
            resolve({ value: undefined, done: true })
          );
          await subscriber.unsubscribe(channel);
          subscriber.disconnect();
          return { value: undefined, done: true };
        }
      };
    }
  };
}
