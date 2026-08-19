import { BookOpen, Upload, FileText, Trash2, MessageSquare, Plus, History, X } from "lucide-react";

// ── Add to component state ──
// const [conversations, setConversations] = useState([
//   { id: "c1", title: "Resume feedback", updatedAt: "2h ago" },
//   { id: "c2", title: "Contract clause review", updatedAt: "Yesterday" },
// ]);
// const [activeConversationId, setActiveConversationId] = useState("c1");
//
// function newConversation() {
//   const id = crypto.randomUUID();
//   setConversations((prev) => [{ id, title: "New conversation", updatedAt: "Just now" }, ...prev]);
//   setActiveConversationId(id);
//   setMessages([]); // clear chat pane
// }

export default function Sidebar({
  docs, selectedCount, dragOver, setDragOver, addFiles, toggleDoc, removeDoc,
  mode, setMode,
  conversations, activeConversationId, setActiveConversationId, onNewConversation, onSelectConversation,
}) {
  return (
    <aside
      className="flex w-72 shrink-0 flex-col"
      style={{ background: "#21242E", color: "#F6F4EF" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5" style={{ borderBottom: "1px solid #33374380" }}>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md"
          style={{ background: "#B8935A" }}
        >
          <BookOpen size={17} color="#21242E" />
        </div>
        <div>
          <div className="text-[13px] font-semibold tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Archivist
          </div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: "#8C8FA0" }}>
            Document Assistant
          </div>
        </div>
      </div>

      {/* New conversation */}
      <div className="px-5 pt-4">
        <button
          onClick={onNewConversation}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[12px] font-medium transition-colors"
          style={{ background: "#B8935A", color: "#21242E" }}
        >
          <Plus size={14} />
          New conversation
        </button>
      </div>

      {/* Upload zone */}
      <div className="px-5 pt-4">
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-5 text-center transition-colors"
          style={{
            borderColor: dragOver ? "#B8935A" : "#454A59",
            background: dragOver ? "#2C3040" : "transparent",
          }}
        >
          <Upload size={16} color="#B8935A" />
          <span className="text-[12px] font-medium">Upload PDF</span>
          <span className="text-[10px]" style={{ color: "#8C8FA0" }}>
            drag &amp; drop or click to browse
          </span>
          <input
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>
      </div>

      {/* Document list */}
      <div className="px-5 pt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest" style={{ color: "#8C8FA0" }}>
            Documents
          </span>
          <span className="text-[10px]" style={{ color: "#8C8FA0" }}>
            {selectedCount}/{docs.length} active
          </span>
        </div>

        <ul className="flex flex-col gap-1.5">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="group relative flex items-center gap-2.5 rounded-md py-2 pl-2.5 pr-2 transition-colors"
              style={{ background: doc.selected ? "#2A2E3B" : "transparent" }}
            >
              {doc.selected && (
                <span
                  className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r"
                  style={{ background: "#B8935A" }}
                />
              )}
              <button
                onClick={() => toggleDoc(doc.id)}
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
                style={{
                  borderColor: doc.selected ? "#B8935A" : "#454A59",
                  background: doc.selected ? "#B8935A" : "transparent",
                }}
                aria-label="toggle document"
              >
                {doc.selected && <div className="h-1.5 w-1.5 rounded-sm" style={{ background: "#21242E" }} />}
              </button>
              <FileText size={14} color="#8C8FA0" className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {doc.name}
                </div>
                <div className="text-[10px]" style={{ color: "#8C8FA0" }}>
                  {doc.size}
                </div>
              </div>
              <button
                onClick={() => removeDoc(doc.id)}
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="remove document"
              >
                <Trash2 size={13} color="#8C8FA0" />
              </button>
            </li>
          ))}
          {docs.length === 0 && (
            <li className="py-6 text-center text-[11px]" style={{ color: "#8C8FA0" }}>
              No documents yet.
            </li>
          )}
        </ul>
      </div>

      {/* History */}
<div className="flex-1 overflow-y-auto px-5 pt-5">
  <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: "#8C8FA0" }}>
    <History size={11} />
    History
  </div>

  <ul className="flex flex-col gap-1">
    {conversations.map((c) => (
      <li
        key={c._id}
        className="group relative flex items-center rounded-md"
        style={{ background: c._id === activeConversationId ? "#2A2E3B" : "transparent" }}
      >
        <button
          onClick={() => setActiveConversationId(c._id)}
          className="flex min-w-0 flex-1 flex-col items-start gap-0.5 px-2.5 py-2 text-left"
        >
          <span
            className="w-full truncate text-[12px]"
            style={{ color: c._id === activeConversationId ? "#F6F4EF" : "#C7C9D3" }}
          >
            {c.title}
          </span>
          <span className="text-[10px]" style={{ color: "#8C8FA0" }}>
            {c.updatedAt}
          </span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteConversation(c._id); }}
          className="mr-1.5 shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/20"
          aria-label="delete conversation"
        >
          <X size={12} color="#8C8FA0" />
        </button>
      </li>
    ))}
    {conversations.length === 0 && (
      <li className="py-6 text-center text-[11px]" style={{ color: "#8C8FA0" }}>
        No past conversations.
      </li>
    )}
  </ul>
</div>

      {/* Mode switch */}
      <div className="px-5 pb-5 pt-3" style={{ borderTop: "1px solid #33374380" }}>
        <div className="mb-2 mt-3 text-[10px] uppercase tracking-widest" style={{ color: "#8C8FA0" }}>
          Mode
        </div>
        <div className="flex rounded-lg p-1" style={{ background: "#181A22" }}>
          {[
            { key: "general", label: "General AI", icon: MessageSquare },
            { key: "document", label: "Document Chat", icon: FileText },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[11.5px] font-medium transition-colors"
              style={{
                background: mode === key ? "#B8935A" : "transparent",
                color: mode === key ? "#21242E" : "#8C8FA0",
              }}
            >
              <Icon size={12.5} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}