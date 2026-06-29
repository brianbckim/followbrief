import { startWorkflowWorker } from "./workers/execute-workflow-worker";
import { logger } from "./logger/logger";

const worker = startWorkflowWorker();

logger.info("FollowBrief workflow worker started");

async function shutdown() {
  logger.info("Stopping FollowBrief workflow worker");
  await worker.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
