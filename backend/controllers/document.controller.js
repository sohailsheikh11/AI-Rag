import { v4 as uuid } from "uuid";
import { extractText, chunkText } from "../services/pdf.service.js";
import { embedBatch, embedOne } from "../services/embedding.service.js";
import * as vectorStore from "../services/vectorStore.service.js";
import Document from "../model/document.js";
import crypto from 'crypto'
import fs from 'fs'

export async function uploadDocument(req, res) {
  try {

     console.log("Upload hit. File:", req.file?.originalname, req.file?.size);
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are supported" });
    }

    const fileBuffer = req.file.buffer;

const fileHash = crypto
  .createHash("sha256")
  .update(fileBuffer)
  .digest("hex");

    const text = await extractText(req.file.buffer);
    const chunkTexts = chunkText(text);

    console.log("this is the chunk text", chunkTexts);

    if (chunkTexts.length === 0) {
      return res.status(400).json({ error: "No extractable text found in PDF" });
    }

    const embeddings = await embedBatch(chunkTexts);
    /* const chunks = chunkTexts.map((t, i) => ({
      id: uuid(),
      text: t,
      embedding: embeddings[i],
    })); */
    const documentId = uuid();

    const documents = chunkTexts.map((text, i) => ({
      documentId,
      fileHash,
  content: text,
  embedding: embeddings[i],
  metadata: {
    filename: req.file.originalname,
    chunkIndex: i,
  },
}));

const existingDocument = await Document.findOne({ fileHash });

if (existingDocument) {
  return res.status(409).json({
    message: "This file has already been uploaded.",
  });
}

await Document.insertMany(documents);

    

    res.json({message: "successfully added the documents"});
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
