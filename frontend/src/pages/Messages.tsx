import { useState, useEffect, useRef } from "react";
import MaterialIcon from "../components/ui/MaterialIcon";
import ProfileGate from "../components/ui/ProfileGate";
import { useHomigoAuth } from "../components/auth/AuthContext";
import { CHAT_CONTACTS, MOCK_THREADS, type ChatContact, type ChatMessage } from "../lib/mockData";
import { api } from "../lib/api";
import type { Conversation, Message } from "../lib/types";

type PageProps = { onNavigate: (page: string) => void };

export default function Messages({ onNavigate }: PageProps) {
  const { userId } = useHomigoAuth();

  // Remote conversation data (falls back to mock on error)
  const [remoteConversations, setRemoteConversations] = useState<Conversation[]>([]);
  const [remoteMessages, setRemoteMessages] = useState<Message[]>([]);

  // Active contact and mobile view state
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  // On mobile, show chat panel only when a contact is selected
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeContact: ChatContact | undefined =
    CHAT_CONTACTS.find((c) => c.id === activeContactId) ?? CHAT_CONTACTS[0];

  const displayedThread: ChatMessage[] =
    activeContact ? (MOCK_THREADS[activeContact.id] ?? []) : [];

  // Merge remote messages if available
  const mergedMessages = remoteMessages.length
    ? remoteMessages.map((m) => ({
        sender: String(m.sender_id) === String(userId) ? ("me" as const) : ("other" as const),
        text: m.body,
        time: m.sent_at ? new Date(m.sent_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "",
      }))
    : displayedThread;

  useEffect(() => {
    api.listConversations(userId)
      .then((r) => setRemoteConversations(r.data ?? []))
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    const cid = remoteConversations[0]?.conversation_id;
    if (!cid) return;
    api.getMessages(cid).then((r) => setRemoteMessages(r.data ?? [])).catch(() => {});
  }, [remoteConversations]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mergedMessages, activeContactId]);

  const openChat = (id: string) => {
    setActiveContactId(id);
    setMobileChatOpen(true);
  };

  const closeMobileChat = () => setMobileChatOpen(false);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const cid = remoteConversations[0]?.conversation_id;
    if (cid) {
      try {
        await api.sendMessage(cid, { sender_id: userId as number, body: newMessage.trim() });
      } catch (e) {
        console.error("[Messages] sendMessage failed:", e);
      }
    }
    setNewMessage("");
  };

  // ─── Contact list panel ─────────────────────────────────────────────────────
  const ContactList = (
    <aside className="flex h-full flex-col bg-surface-container-low">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-container px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-primary"
            aria-label="Back to dashboard"
          >
            <MaterialIcon name="arrow_back" className="text-base" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <h2 className="font-headline text-xl font-bold text-on-surface">Messages</h2>
        </div>
        <button className="rounded-full p-2 hover:bg-surface-container" aria-label="Compose">
          <MaterialIcon name="edit_square" className="text-primary" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm" />
          <input placeholder="Search conversations" className="pl-9 text-sm" />
        </div>
      </div>

      {/* Threads */}
      <div className="flex-1 overflow-y-auto">
        {CHAT_CONTACTS.map((contact) => {
          const isActive = contact.id === activeContactId;
          return (
            <button
              key={contact.id}
              onClick={() => openChat(contact.id)}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-container active:bg-surface-container ${isActive ? "border-l-4 border-primary bg-primary/5" : ""}`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                {contact.online && (
                  <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                )}
              </div>
              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className={`truncate text-sm font-bold ${isActive ? "text-primary" : "text-on-surface"}`}>
                    {contact.name}
                  </p>
                  <span className="ml-2 shrink-0 text-[10px] text-outline">{contact.time}</span>
                </div>
                <p className="truncate text-xs text-on-surface-variant">{contact.lastMessage}</p>
                <p className="mt-0.5 truncate text-[10px] font-semibold text-primary">{contact.context}</p>
              </div>
              {contact.unread > 0 && (
                <span className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">
                  {contact.unread}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );

  // ─── Chat panel ────────────────────────────────────────────────────────────
  const ChatPanel = activeContact ? (
    <section className="flex min-h-0 flex-1 flex-col">
      {/* Chat header */}
      <header className="flex shrink-0 items-center justify-between border-b border-surface-container bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {/* Back button — mobile: back to list; desktop: back to dashboard */}
          <button
            onClick={closeMobileChat}
            className="mr-1 flex items-center justify-center rounded-full p-2 hover:bg-surface-container lg:hidden"
            aria-label="Back to conversations"
          >
            <MaterialIcon name="arrow_back" />
          </button>
          <img src={activeContact.avatar} alt={activeContact.name} className="h-10 w-10 rounded-full object-cover" />
          <div>
            <h2 className="font-headline text-sm font-bold leading-tight">{activeContact.name}</h2>
            <p className={`text-xs font-medium ${activeContact.online ? "text-green-600" : "text-outline"}`}>
              {activeContact.online ? "Online now" : "Last seen recently"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-full p-2 hover:bg-surface-container" aria-label="Video call">
            <MaterialIcon name="videocam" className="text-on-surface-variant" />
          </button>
          <button className="rounded-full p-2 hover:bg-surface-container" aria-label="More options">
            <MaterialIcon name="more_vert" className="text-on-surface-variant" />
          </button>
        </div>
      </header>

      {/* Context chip */}
      <div className="shrink-0 border-b border-surface-container bg-primary/5 px-4 py-2">
        <span className="flex w-fit items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <MaterialIcon name="home" className="text-sm" />
          {activeContact.context}
        </span>
      </div>

      {/* Messages scroll area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-5">
        {mergedMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
            {msg.sender !== "me" && (
              <img src={activeContact.avatar} alt="" className="mr-2 h-7 w-7 shrink-0 self-end rounded-full object-cover" />
            )}
            <div className={`max-w-[72%] ${msg.sender === "me" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              <p
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.sender === "me"
                    ? "rounded-br-sm bg-primary text-white"
                    : "rounded-bl-sm bg-white text-on-surface shadow-sm"
                }`}
              >
                {msg.text}
              </p>
              <span className="px-1 text-[10px] text-outline">{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input — gated behind profile completion */}
      <div className="shrink-0 border-t border-surface-container bg-white px-4 py-3">
        <ProfileGate action="send a message" onNavigate={onNavigate}>
          <div className="flex items-center gap-2">
            <button className="rounded-full p-2 hover:bg-surface-container" aria-label="Attach file">
              <MaterialIcon name="attach_file" className="text-outline" />
            </button>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type your message…"
              className="flex-1 rounded-full bg-surface-container-highest px-4 py-2.5 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90 disabled:opacity-40"
              aria-label="Send"
            >
              <MaterialIcon name="send" className="text-sm" />
            </button>
          </div>
        </ProfileGate>
      </div>
    </section>
  ) : (
    <section className="hidden flex-1 items-center justify-center lg:flex">
      <div className="text-center text-on-surface-variant">
        <MaterialIcon name="chat_bubble_outline" className="text-5xl text-outline" />
        <p className="mt-4 font-headline font-bold">Select a conversation</p>
        <p className="mt-1 text-sm">Choose from the list to start chatting.</p>
      </div>
    </section>
  );

  // ─── Right details panel ────────────────────────────────────────────────────
  const DetailsPanel = activeContact && (
    <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-surface-container bg-surface-container-low p-5 xl:block">
      <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-outline">Contact Info</h3>
      <div className="card mb-4 text-center">
        <img src={activeContact.avatar} alt={activeContact.name} className="mx-auto h-16 w-16 rounded-full object-cover" />
        <p className="mt-3 font-headline font-bold text-on-surface">{activeContact.name}</p>
        <p className="text-xs text-primary">{activeContact.context}</p>
        <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${activeContact.online ? "bg-green-100 text-green-700" : "bg-surface-container text-outline"}`}>
          <span className={`h-2 w-2 rounded-full ${activeContact.online ? "bg-green-500" : "bg-outline"}`} />
          {activeContact.online ? "Online" : "Offline"}
        </div>
      </div>
      <div className="card">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-outline">Shared Context</p>
        <p className="text-sm text-on-surface-variant">{activeContact.context}</p>
        <button
          onClick={() => onNavigate("accommodation")}
          className="mt-4 flex w-full items-center justify-between rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
        >
          View listing <MaterialIcon name="arrow_forward" className="text-sm" />
        </button>
      </div>
    </aside>
  );

  // ─── Layout ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-surface pt-16">
      {/* Mobile: toggle between list and chat */}
      <div className={`w-full shrink-0 flex-col lg:w-80 lg:flex ${mobileChatOpen ? "hidden lg:flex" : "flex"}`}>
        {ContactList}
      </div>

      <div className={`min-w-0 flex-1 flex-col lg:flex ${mobileChatOpen ? "flex" : "hidden lg:flex"}`}>
        {ChatPanel}
      </div>

      {DetailsPanel}
    </div>
  );
}