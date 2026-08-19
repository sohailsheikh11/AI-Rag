import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "..", "data", "vectorstore.json");

// In-memory shape: { [docId]: { id, name, size, chunks: [{ id, text, embedding }] } }
let store = {};

function ensureDataDir() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function loadStore() {
  ensureDataDir();
  if (fs.existsSync(DB_FILE)) {
    store = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  }
}

function persist() {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(store));
}

export function addDocument({ id, name, size, chunks }) {
  store[id] = { id, name, size, chunks };
  persist();
}

export function removeDocument(id) {
  delete store[id];
  persist();
}

export function listDocuments() {
  return Object.values(store).map(({ id, name, size, chunks }) => ({
    id,
    name,
    size,
    chunkCount: chunks.length,
  }));
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Search top-K chunks across the given documentIds for the query embedding.
export function search(documentIds, queryEmbedding, topK = 5) {
  const candidates = [];
  for (const docId of documentIds) {
    const doc = store[docId];
    if (!doc) continue;
    for (const chunk of doc.chunks) {
      candidates.push({
        docName: doc.name,
        text: chunk.text,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
      });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, topK);
}
