import { embedOne } from "../services/embedding.service.js";
import { streamGeneralChat, streamDocumentChat } from "../services/llm.service.js";
import * as vectorStore from "../services/vectorStore.service.js";
import Document from "../model/document.js";
import { Message } from "../model/messages.js";
import Conversation from "../model/conversations.js";

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
  const { message, conversationId } = req.body;

  
  if (!message) return res.status(400).json({ error: "message is required" });

  initSSE(res);
  try {

    await Message.create({
    conversationId: conversationId,
    text: message,
    role: "user"
   })

   

   let fullAnswer = "";

   const messages = await Message.find({ conversationId })
  .sort({ createdAt: -1 })
  .limit(10)
  .lean();

messages.reverse();

let conversationContext = "";

for (const message of messages) {
  conversationContext += `${message.role}: ${message.text}\n`;
}



    await streamGeneralChat(conversationContext, (token) => {
      fullAnswer += token;
      sendToken(res, token)
    });

    await Message.create({
  conversationId: conversationId,
  text: fullAnswer,
  role: "ai"
});

    sendDone(res);
  } catch (err) {
    console.error("General chat error:", err);
    sendToken(res, "⚠ Something went wrong generating a response.");
    sendDone(res);
  }
}

export async function documentChat(req, res) {
  const { message, documentIds, conversationId } = req.body;

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

    const messages = await Message.find({ conversationId })
  .sort({ createdAt: -1 })
  .limit(10)
  .lean();

messages.reverse();

let conversationContext = "";

for (const message of messages) {
  conversationContext += `${message.role}: ${message.text}\n`;
}


    let fullAnswer = "";

    await streamDocumentChat(conversationContext, contextChunks, (token) => {
    fullAnswer += token;
    sendToken(res, token);
  });

  let conversation;

if (!conversationId) {
  conversation = await Conversation.create({
    title: message.slice(0, 50),
    documentIds,
  });
} else {
  conversation = await Conversation.findById(conversationId);
}

console.log(conversation);

await Message.create({
  conversationId: conversation._id,
  role: "user",
  text: message
})

  await Message.create({
  conversationId: conversation._id,
  role: "ai",
  text: fullAnswer,
});

    sendDone(res);
  } catch (err) {
    console.error("Document chat error:", err);
    sendToken(res, "⚠ Something went wrong generating a response.");
    sendDone(res);
  }
}
