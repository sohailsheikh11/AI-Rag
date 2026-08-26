import "dotenv/config";
import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

const queue = new Queue("document-processing", {
  connection,
});

const counts = await queue.getJobCounts();

console.log(counts);

await connection.quit();