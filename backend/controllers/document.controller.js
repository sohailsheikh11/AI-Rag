import { v4 as uuid } from "uuid";
import { extractText, chunkText } from "../services/pdf.service.js";
import { embedBatch, embedOne } from "../services/embedding.service.js";
import * as vectorStore from "../services/vectorStore.service.js";
import Document from "../model/document.js";
import crypto from 'crypto'
import fs from 'fs/promises'
import path from "path";
import { documentQueue } from "../queues/document.queue.js";
import { fileURLToPath } from "url";

export async function uploadDocument(req, res) {
  try {

     console.log("Upload hit. File:", req.file?.originalname, req.file?.size);

     const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are supported" });
    }

    const fileHash = crypto
  .createHash("sha256")
  .update(req.file.buffer)
  .digest("hex");

    const existingDocument = await Document.findOne({ fileHash });
       
       if (existingDocument) {
         return res.status(409).json({
      message: "This file has already been uploaded."
    });
       }

       const __filename = fileURLToPath(import.meta.url);
       const __dirname = path.dirname(__filename);

      

    

    const fileName = `${crypto.randomUUID()}-${file.originalname}`;

    const uploadDir = path.join(__dirname, "../uploads");

    await fs.mkdir(uploadDir, { recursive: true });

const filePath = path.join(uploadDir, fileName);

await fs.writeFile(filePath, file.buffer);

    console.log("File saved at:", filePath);

    

    const document = await Document.create({
  filename: req.file.originalname,
  fileHash,
  status: "processing",
});
    
    await documentQueue.add("process-document", {
      documentId: document._id,
      filePath,
      filename: file.originalname,
      fileHash
  
});

res.status(202).json({
      message: "File uploaded and processing started"
    });

    

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to process document" });
  }
}

export async function listDocuments(req, res) {

  try {

   const document = await Document.findOne();

 

  const documents = await Document.aggregate([
      {
        $group: {
          _id: "$documentId",
          name: {
            $first: "$metadata.filename",
          },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
        },
      },
    ]);

    console.log(documents);

    res.json(documents);
    
  } catch (error) {

    console.log(error);
    res.json({
      message: "failed"
    })
    
  }
}

export function deleteDocument(req, res) {
  vectorStore.removeDocument(req.params.id);
  res.json({ success: true });
}
