import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  Send,
  Bot,
  User,
  Trash2,
  BookOpen,
  MessageSquare,
  X,
} from "lucide-react";
import Sidebar from "../component/sidebar";

// ---- design tokens ----
// bg:      #F6F4EF  (paper)
// ink:     #21242E  (sidebar / primary text)
// muted:   #8C8FA0
// brass:   #B8935A  (accent / active ribbon)
// line:    #E4E0D6
// user bubble: #21242E
// ai bubble:   #FFFFFF border #E4E0D6

const initialDocs = [
  { id: 1, name: "resume.pdf", size: "142 KB", selected: true },
  { id: 2, name: "spring.pdf", size: "1.1 MB", selected: true },
  { id: 3, name: "java.pdf", size: "860 KB", selected: false },
];

const initialMessages = [
  {
    id: 1,
    role: "ai",
    text: "Ask me anything about your selected documents, or switch to General AI for open chat.",
  },
];

// ---- backend config ----
const API_BASE = "http://localhost:8080";
const ENDPOINTS = {
  general: `${API_BASE}/api/chat/general`,
  document: `${API_BASE}/api/chat/document`,
  upload: `${API_BASE}/api/documents/upload`,
};

// Streams an SSE (text/event-stream) POST response, calling onToken for each
// "data: ..." chunk. Returns when the stream ends.
async function streamChat(url, body, onToken, onDone, onError) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      onError(`Request failed (${res.status})`);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop(); // keep last incomplete chunk

      for (const evt of events) {
        const line = evt.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;
        const data = line.slice(5);

        console.log(JSON.stringify(data));
        if (data === " [DONE]" || data ==="[DONE]") continue;
        onToken(data);
      }
    }
    onDone();
  } catch (err) {
    onError(err.message || "Connection error");
  }
}

export default function DocumentAssistant() {
  const [docs, setDocs] = useState(initialDocs);
  const [mode, setMode] = useState("document"); // "general" | "document"
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const scrollRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // ── Add to component state ──
 const [conversations, setConversations] = useState([
  { id: "c1", title: "Resume feedback", updatedAt: "2h ago" },
  { id: "c2", title: "Contract clause review", updatedAt: "Yesterday" },
]);
 const [activeConversationId, setActiveConversationId] = useState("c1");

 async function newConversation() {
   const id = crypto.randomUUID();

   const res = await fetch(`${API_BASE}/api/conversations`,{
    method: "POST",
    "Content-type": "application/json"
   });

   const data = await res.json();

   console.log("this is the data", data);


  setConversations((prev) => [data, ...prev]);
  setActiveConversationId(id);
   setMessages([]); // clear chat pane
 }

 //initialize the conversation data

 useEffect(() => {
  async function fetchConversation() {
    try {
      const response = await fetch(`${API_BASE}/api/conversations`);
    const data = await response.json();

    console.log("this is the data", data);

    setConversations(data);
    } catch (error) {

      console.log("this is the error", error)
      
    }
  }

  fetchConversation();
}, []);

 function onSelectConversation(id) {
  setActiveConversationId(id);
  const convo = conversations.find((c) => c.id === id);
  setMessages(convo?.messages || []);
}

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const toggleDoc = (id) =>
    setDocs((d) => d.map((x) => (x.id === id ? { ...x, selected: !x.selected } : x)));

  const removeDoc = (id) => setDocs((d) => d.filter((x) => x.id !== id));

  const addFiles =  async (fileList) => {
    const files = Array.from(fileList).filter((f) => f.type === "application/pdf");

    if(files.length  === 0){
      return;
    }


    for(const file of files){

      try {

        const formData = new FormData();

      formData.append("file", file);

      const res = await fetch(ENDPOINTS.upload, {
        method: "POST",
        body: formData
      });

        

      if(!res.ok) throw new Error("upload failed");

      const doc = await res.json();

      console.log("Upload response:", doc);

      setDocs((d)=> [...d, {...doc, selected: true}])
        
      } catch (error) {

        console.log("this is the error", error);
        
      }

       

    }

     setUploading(false);

    /* const newDocs = files.map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      size: `${Math.max(1, Math.round(f.size / 1024))} KB`,
      selected: true,
    }));
    if (newDocs.length) setDocs((d) => [...d, ...newDocs]); */
  };


  async function getAllDocs(){

    const res = await fetch(`${API_BASE}/api/documents`);

    const results = await res.json();

    

    const data = results.map(result=>{
      return {...result, selected: true}
    })

    console.log("this is the data",data);

    setDocs(data);



  }

  useEffect(()=>{

    getAllDocs();

  },[])

  const selectedCount = docs.filter((d) => d.selected).length;

  const [streaming, setStreaming] = useState(false);

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

  const sendMessage = () => {
    const text = input.trim();
    if (!text || streaming) return;

    if (mode === "document" && selectedCount === 0) {
      setMessages((m) => [
        ...m,
        { id: Date.now(), role: "user", text },
        { id: Date.now() + 1, role: "ai", text: "Select at least one document to chat with your files." },
      ]);
      setInput("");
      return;
    }

    const userMsg = { id: Date.now(), role: "user", text };
    const aiMsgId = Date.now() + 1;
    setInput("");
    setStreaming(true);
    setMessages((m) => [...m, userMsg, { id: aiMsgId, role: "ai", text: "" }]);

    const url = mode === "document" ? ENDPOINTS.document : ENDPOINTS.general;
    const body =
      mode === "document"
        ? { message: text, documentIds: docs.filter((d) => d.selected).map((d) => d.id) }
        : { message: text };

    streamChat(
      url,
      body,
      (token) => {
        setMessages((m) =>
          m.map((msg) => (msg.id === aiMsgId ? { ...msg, text: msg.text + token } : msg))
        );
      },
      () => setStreaming(false),
      (errMsg) => {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === aiMsgId ? { ...msg, text: `⚠ ${errMsg}. Is the backend running on :8080?` } : msg
          )
        );
        setStreaming(false);
      }
    );
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="flex h-dvh w-full overflow-hidden rounded-xl border"
      style={{ background: "#F6F4EF", borderColor: "#E4E0D6", fontFamily: "'Inter', ui-sans-serif, system-ui" }}
    >
      {/* SIDEBAR */}
<Sidebar
  docs={docs}
  selectedCount={selectedCount}
  dragOver={dragOver}
  setDragOver={setDragOver}
  addFiles={addFiles}
  toggleDoc={toggleDoc}
  removeDoc={removeDoc}
  mode={mode}
  setMode={setMode}
  conversations={conversations}
  activeConversationId={activeConversationId}
  setActiveConversationId={setActiveConversationId}
  onNewConversation={newConversation}
  onSelectConversation={onSelectConversation}
/>
      {/* CHAT PANEL */}
      <main className="flex flex-1 flex-col" style={{ background: "#F6F4EF" }}>
        {/* header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #E4E0D6" }}
        >
          <div>
            <div className="text-[14px] font-semibold" style={{ color: "#21242E", fontFamily: "'Space Grotesk', sans-serif" }}>
              {mode === "document" ? "Document Chat" : "General AI"}
            </div>
            <div className="text-[11.5px]" style={{ color: "#8C8FA0" }}>
              {mode === "document"
                ? selectedCount > 0
                  ? `Grounded in ${selectedCount} selected document${selectedCount > 1 ? "s" : ""}`
                  : "No documents selected"
                : "Open conversation, no document context"}
            </div>
          </div>
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide"
            style={{
              background: mode === "document" ? "#EFE6D4" : "#E7E9F5",
              color: mode === "document" ? "#8A6A32" : "#454A8C",
            }}
          >
            {mode === "document" ? "RAG" : "Chat"}
          </span>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: m.role === "user" ? "#21242E" : "#B8935A" }}
                >
                  {m.role === "user" ? <User size={13} color="#F6F4EF" /> : <Bot size={13} color="#21242E" />}
                </div>
                <div
                  className="max-w-[70%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed"
                  style={
                    m.role === "user"
                      ? { background: "#21242E", color: "#F6F4EF" }
                      : { background: "#FFFFFF", color: "#21242E", border: "1px solid #E4E0D6" }
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* input */}
        <div className="px-6 pb-5 pt-2">
          <div
            className="flex items-end gap-2 rounded-xl px-3 py-2"
            style={{ background: "#FFFFFF", border: "1px solid #E4E0D6" }}
          >
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={
                mode === "document" ? "Ask a question about your documents…" : "Message General AI…"
              }
              className="max-h-24 flex-1 resize-none bg-transparent text-[13px] outline-none placeholder:text-[#8C8FA0]"
              style={{ color: "#21242E" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || streaming}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-opacity disabled:opacity-40"
              style={{ background: "#21242E" }}
            >
              <Send size={14} color="#F6F4EF" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}