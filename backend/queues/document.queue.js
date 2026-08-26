import { Queue } from "bullmq";
import IORedis from "ioredis";


const connection = new IORedis({
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null
});

export const documentQueue = new Queue("document-processing", {
  connection,
});

const counts = await documentQueue.getJobCounts();

console.log(counts);