import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, FileText, Loader2, Bot, User } from "lucide-react";

// ── CONFIG: point these at your Spring Boot backend ──
const API_BASE = "http://localhost:8080";
const CHAT_SSE_ENDPOINT = `${API_BASE}/search`; // POST, text/event-stream response
const PDF_UPLOAD_ENDPOINT = `${API_BASE}/pdf/upload`; // POST, multipart/form-data

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    console.log("these are the messages", messages)
  }, [messages]);

  function pickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    setError(null);
    setFile(f);
  }

  async function uploadPdf(f) {
    const form = new FormData();
    form.append("file", f);
    setUploading(true);
    setError(null);
    try {
      const res = await fetch(PDF_UPLOAD_ENDPOINT, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      return await res.json().catch(() => ({}));
    } catch (err) {
      setError(err.message || "Upload failed.");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() && !file) return;
    setError(null);

    let attachedFile = file;
    setFile(null);

    const userMsg = {
      role: "user",
      text: input.trim(),
      fileName: attachedFile?.name || null,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    let docMeta = null;
    if (attachedFile) {
      docMeta = await uploadPdf(attachedFile);
    }

    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", text: "" }]);
    setStreaming(true);

    try {
      const res = await fetch(`${API_BASE}/search?question=${input}`);

      if (!res.ok || !res.body) throw new Error(`Chat request failed (${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        console.log("this is the value", value);
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        console.log("this is the initial buffer",buffer)

        const lines = buffer.split("\n");

        console.log("this is the lines", lines);
        buffer = lines.pop() || "";

        console.log("this is the buffer", buffer);

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const chunk = line.slice(5).trim();

         

          console.log("this is the chunk", chunk)
          if (chunk === "[DONE]") continue;
          setMessages((prev) => {
            const next = [...prev];
            next[assistantIndex] = {
              ...next[assistantIndex],
              text: next[assistantIndex].text + chunk + " ",
            };
            return next;
          });
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#0B0F1A] text-[#E7E5EF]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
        @keyframes pulse-dot { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }
        .dot { animation: pulse-dot 1.4s infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {/* Header */}
      <header className="flex items-center gap-3 border-b border-[#241E3D] px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#5B3FE0] to-[#7C5CFF]">
          <Bot size={18} />
        </div>
        <div>
          <h1 className="font-display text-lg font-semibold tracking-wide">AI Chat</h1>
          <p className="font-body text-xs text-[#8B87A6]">Connected to Spring Boot backend</p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {messages.length === 0 && (
            <div className="mt-24 text-center font-body text-sm text-[#635E82]">
              Ask a question, or attach a PDF to discuss it.
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  m.role === "user" ? "bg-[#7C5CFF]/20 text-[#B6A6FF]" : "bg-[#241E3D] text-[#B6A6FF]"
                }`}
              >
                {m.role === "user" ? <User size={15} /> : <Bot size={15} />}
              </div>
              <div
                className={`font-body max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-[#5B3FE0] to-[#7C5CFF] text-white"
                    : "bg-[#151228] text-[#E7E5EF]"
                }`}
              >
                {m.fileName && (
                  <div className="mb-2 flex items-center gap-2 rounded-lg bg-black/20 px-2 py-1.5 text-xs">
                    <FileText size={13} />
                    <span className="truncate">{m.fileName}</span>
                  </div>
                )}
                {m.text ? (
                  <span className="whitespace-pre-wrap">{m.text}</span>
                ) : streaming && i === messages.length - 1 ? (
                  <span className="inline-flex gap-1">
                    <span className="dot h-1.5 w-1.5 rounded-full bg-[#B6A6FF]" />
                    <span className="dot h-1.5 w-1.5 rounded-full bg-[#B6A6FF]" />
                    <span className="dot h-1.5 w-1.5 rounded-full bg-[#B6A6FF]" />
                  </span>
                ) : null}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Error */}
      {error && (
        <div className="mx-auto mb-2 w-full max-w-2xl px-6">
          <div className="font-body rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        </div>
      )}

      {/* Composer */}
      <footer className="border-t border-[#241E3D] px-6 py-4">
        <div className="mx-auto max-w-2xl">
          {file && (
            <div className="mb-2 flex w-fit items-center gap-2 rounded-lg bg-[#151228] px-3 py-1.5 text-xs text-[#B6A6FF]">
              <FileText size={13} />
              <span className="max-w-[200px] truncate">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-[#635E82] hover:text-white">
                <X size={13} />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 rounded-2xl border border-[#241E3D] bg-[#0F0C1E] px-3 py-2 focus-within:border-[#5B3FE0]">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Attach PDF"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#8B87A6] hover:bg-[#241E3D] hover:text-white disabled:opacity-50"
            >
              {uploading ? <Loader2 size={17} className="animate-spin" /> : <Paperclip size={17} />}
            </button>
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={pickFile} className="hidden" />

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message the assistant..."
              rows={1}
              className="font-body max-h-32 flex-1 resize-none bg-transparent py-2 text-sm text-[#E7E5EF] placeholder-[#635E82] outline-none"
            />

            <button
              onClick={sendMessage}
              disabled={streaming || (!input.trim() && !file)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#5B3FE0] to-[#7C5CFF] text-white disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}