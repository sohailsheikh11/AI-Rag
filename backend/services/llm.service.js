import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const CHAT_MODEL = process.env.CHAT_MODEL || "gemini-2.5-flash";

async function streamGenerate(systemInstruction, message, onToken) {
  const stream = await ai.models.generateContentStream({
    model: CHAT_MODEL,
    contents: message,
    config: { systemInstruction },
  });

  

  for await (const chunk of stream) {
    
    if (chunk.text) {
      

      onToken(chunk.text);
    }
  }
}

export async function streamGeneralChat(message, onToken) {
  await streamGenerate("You are a helpful, concise assistant.", message, onToken);
}

export async function streamDocumentChat(message, contextChunks, onToken) {
  const context = contextChunks
    .map((c, i) => `[${i + 1}] (${c.filename})\n${c.content}`)
    .join("\n\n");

  const systemInstruction = `You are a document assistant. Answer ONLY using the provided context.
If the context does not contain the answer, say you don't have enough information in the documents.
Cite sources inline using [1], [2], etc. matching the context blocks.

Context:
${context}`;

  await streamGenerate(systemInstruction, message, onToken);
}
