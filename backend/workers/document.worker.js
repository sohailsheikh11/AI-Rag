import { tryCatch, Worker } from "bullmq";
import IORedis from "ioredis";
import "dotenv/config";
import { extractText, chunkText } from "../services/pdf.service.js";
import { embedBatch, embedOne } from "../services/embedding.service.js";
import Document from "../model/document.js";
import fs from "fs/promises";
import Chunk from "../model/chunk.js";

import { connectDB } from "../config/db.js";

console.log("Mongo URI exists:", !!process.env.MONGO_URI);
console.log("Gemini key exists:", !!process.env.GEMINI_API_KEY);

await connectDB();



const connection = new IORedis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "document-processing",
  async (job) => {

    console.log("job is here");

    

    

        console.log("Job received:", job.id);
    console.log("Document ID:", job.data.documentId);

    const { filePath, filename, documentId, } = job.data;

    const fileBuffer = await fs.readFile(filePath);


    const text = await extractText(fileBuffer);
    const chunkTexts = chunkText(text);

    

    console.log(`[${job.id}] Created ${chunkTexts.length} chunks`);

  console.log(`[${job.id}] Generating embeddings`);
    
        if (chunkTexts.length === 0) {
          throw new Error("no text found in the pdf")
        }

   const embeddings = await embedBatch(chunkTexts);

    console.log(`[${job.id}] Embeddings generated`);

   
   
   
       const documents = chunkTexts.map((text, i) => ({
         documentId,
     content: text,
     embedding: embeddings[i],
     metadata: {
       filename: filename,
       chunkIndex: i,
     },
   }));
   

   console.log(`[${job.id}] Saving ${documents.length} chunks`);
   
   
       await Chunk.insertMany(documents);

       

        console.log(`[${job.id}] Updating document status`);

       await Document.findByIdAndUpdate(documentId, {
    status: "completed",
  });
        
    
    
   
  },
  {
    connection,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);


});

worker.on("failed", async (job, error) => {

    console.log("job failed");
    console.log("🔥 JOB FAILED EVENT");
  console.log("Job ID:", job?.id);
  console.log("Error:", error.message);
  await Document.findByIdAndUpdate(job.data.documentId, {
    status: "failed",
    error: error.message,
  });
});

console.log("Document worker started");