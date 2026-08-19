import { embedOne } from "../services/embedding.service.js";
import { streamGeneralChat, streamDocumentChat } from "../services/llm.service.js";
import * as vectorStore from "../services/vectorStore.service.js";
import Document from "../model/document.js";

function initSSE(res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });
}

function sendToken(res, token) {
  // Escape newlines so multi-line tokens stay inside a single SSE "data:" field.
  const safe = token.replace(/\n/g, "\\n");
  res.write(`data: ${safe}\n\n`);
}

function sendDone(res) {
  res.write("data: [DONE]\n\n");
  res.end();
}

export async function generalChat(req, res) {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "message is required" });

  initSSE(res);
  try {
    await streamGeneralChat(message, (token) => sendToken(res, token));
    sendDone(res);
  } catch (err) {
    console.error("General chat error:", err);
    sendToken(res, "⚠ Something went wrong generating a response.");
    sendDone(res);
  }
}

export async function documentChat(req, res) {
  const { message, documentIds } = req.body;

  console.log(message);
  if (!message) return res.status(400).json({ error: "message is required" });
  if (!documentIds?.length) return res.status(400).json({ error: "documentIds is required" });

  initSSE(res);
  try {
    const queryEmbedding = await embedOne(message);

    const contextChunks = await Document.aggregate([
  {
    $vectorSearch: {
      index: "autoembed_index",
      path: "embedding",
      queryVector: queryEmbedding,

      filter: {
        documentId: {
          $in: documentIds,
        },
      },

      numCandidates: 100,
      limit: 5,
    },
  },
  {
    $project: {
      content: 1,
      documentId: 1,
      metadata: 1,
      score: {
        $meta: "vectorSearchScore",
      },
    },
  },
]);

console.log(contextChunks.length);

    if (contextChunks.length === 0) {
      sendToken(res, "I couldn't find anything relevant in the selected documents.");
      sendDone(res);
      return;
    }

    console.log("request is here");

    await streamDocumentChat(message, contextChunks, (token) => sendToken(res, token));
    sendDone(res);
  } catch (err) {
    console.error("Document chat error:", err);
    sendToken(res, "⚠ Something went wrong generating a response.");
    sendDone(res);
  }
}
