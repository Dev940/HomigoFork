import MaterialIcon from "../components/ui/MaterialIcon";
import { useEffect, useState } from "react";
import { useHomigoAuth } from "../components/auth/AuthContext";
import { api } from "../lib/api";
import type { Conversation, Message } from "../lib/types";

const contacts = ["Sarah Jenkins", "Marcus Chen", "Elena Rodriguez", "James Wilson"];

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const activeConversationId = conversations[0]?.conversation_id;
  const { userId } = useHomigoAuth();

  useEffect(() => {
    api.listConversations(userId)
      .then((response) => setConversations(response.data ?? []))
      .catch(() => setConversations([]));
  }, [userId]);

  useEffect(() => {
    if (!activeConversationId) return;
    api.getMessages(activeConversationId)
      .then((response) => setMessages(response.data ?? []))
      .catch(() => setMessages([]));
  }, [activeConversationId]);

  const renderedMessages = messages.length
    ? messages.map((message) => [String(message.sender_id) === String(userId) ? "me" : "other", message.body])
    : [
        ["other", "Hey! I checked out the loft you shared. The high ceilings are exactly what we wanted."],
        ["me", "I know, right? It is only 2 blocks from the subway. Should we book a viewing for Saturday?"],
        ["other", "The apartment looks perfect for our budget. Saturday at 11 AM works for me."],
      ];

  return (
    <main className="grid min-h-screen bg-surface lg:grid-cols-[340px_1fr_320px]">
      <aside className="bg-surface-container-low p-5">
        <h2 className="mb-5 font-headline text-xl font-bold text-primary">Messages</h2>
        <input placeholder="Search conversations" />
        <div className="mt-5 space-y-3">
          {contacts.map((name, index) => (
            <button key={name} className={`flex w-full items-center gap-3 rounded-lg p-4 text-left ${index === 1 ? "bg-primary text-white" : "bg-white"}`}>
              <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary-fixed font-bold text-on-secondary-fixed">{name[0]}</div>
              <div><p className="text-sm font-bold">{name}</p><p className={`text-xs ${index === 1 ? "text-white/80" : "text-on-surface-variant"}`}>The apartment looks perfect for our budget!</p></div>
            </button>
          ))}
        </div>
      </aside>
      <section className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between bg-white/80 p-5 shadow-ambient backdrop-blur-xl">
          <div><h2 className="font-headline font-bold">Marcus Chen</h2><p className="text-xs text-primary">Online now</p></div>
          <button className="btn-tonal px-4"><MaterialIcon name="videocam" /></button>
        </header>
        <div className="flex-1 space-y-5 p-6">
          {renderedMessages.map(([sender, text]) => (
            <div key={text} className={`flex ${sender === "me" ? "justify-end" : "justify-start"}`}>
              <p className={`max-w-md rounded-lg p-4 text-sm ${sender === "me" ? "bg-primary text-white" : "bg-white text-on-surface"}`}>{text}</p>
            </div>
          ))}
        </div>
        <div className="bg-white p-5"><input placeholder="Type your message..." /></div>
      </section>
      <aside className="hidden bg-surface-container-low p-6 lg:block">
        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-outline">Contextual Details</h3>
        <div className="card text-center">
          <p className="text-[10px] font-bold uppercase opacity-70">Compatibility Score</p>
          <p className="font-headline text-4xl font-black text-secondary">94%</p>
          <p className="mt-3 text-xs text-on-surface-variant">Shared quiet hours, similar budgets, and weekend routines.</p>
        </div>
      </aside>
    </main>
  );
}
