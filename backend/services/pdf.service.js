import pdfParse from "pdf-parse";

export async function extractText(buffer) {
  const result = await pdfParse(buffer);

  
  return result.text;
}

// Splits text into overlapping word-based chunks for embedding.
export function chunkText(text, chunkSize = 220, overlap = 40) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(" "));
    if (end === words.length) break;
    start = end - overlap;
  }

  
  return chunks;
}
