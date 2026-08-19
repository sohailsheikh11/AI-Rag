import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "gemini-embedding-001";


export async function embedBatch(texts, batchSize = 100) {
  const embeddings = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
     const res = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: batch,
    });
    embeddings.push(...res.embeddings.map((e) => e.values));
  }
  return embeddings;
}

export async function embedOne(text) {
  const res = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: [text],
  });
  return res.embeddings[0].values;
}
