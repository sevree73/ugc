"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  sender: { email: string; role: string };
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessagesPanel({
  briefId,
  currentUserEmail,
}: {
  briefId: string;
  currentUserEmail: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function fetchMessages() {
    const res = await fetch(`/api/messages?briefId=${briefId}`);
    if (res.ok) {
      setMessages(await res.json());
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- poll-on-mount is intentional here
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [briefId]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ briefId, body: text }),
    });

    setSending(false);

    if (res.ok) {
      setText("");
      fetchMessages();
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_-12px_rgba(51,65,85,0.12)]">
      <div className="border-b border-slate-200 px-4 py-3">
        <p className="text-sm font-semibold text-slate-700">Messagerie</p>
      </div>
      <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-slate-400">
            <MessageCircle className="h-6 w-6" />
            <p className="text-sm">Aucun message. Dites bonjour !</p>
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender.email === currentUserEmail;
          return (
            <div
              key={m.id}
              className={cn(
                "flex max-w-[80%] flex-col gap-1",
                mine ? "items-end self-end" : "items-start self-start",
              )}
            >
              {!mine && (
                <p className="px-1 text-xs font-medium text-slate-400">{m.sender.email}</p>
              )}
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                  mine
                    ? "rounded-br-sm bg-pink-200 text-slate-700"
                    : "rounded-bl-sm bg-slate-100 text-slate-700",
                )}
              >
                {m.body}
              </div>
              <span className="px-1 text-[11px] text-slate-400">{formatTime(m.createdAt)}</span>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-200 p-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écrire un message..."
          aria-label="Message"
          className="h-10 flex-1 rounded-full border border-slate-300 bg-white px-4 text-sm placeholder:text-slate-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          aria-label="Envoyer le message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-200 text-slate-700 transition-colors hover:bg-pink-300 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
