"use client";

import { useState, useEffect, useCallback } from "react";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch("/api/admin/settings?type=messages");
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  async function markAsRead(id: string) {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markRead", messageId: id }),
    });
    fetchMessages();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/admin/settings?type=message&id=${id}`, { method: "DELETE" });
    setSelected(null);
    fetchMessages();
  }

  return (
    <div>
      <h1 className="text-2xl font-serif text-primary mb-6">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          {messages.length === 0 ? (
            <p className="text-muted text-sm">No messages yet.</p>
          ) : (
            messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => { setSelected(msg); if (!msg.isRead) markAsRead(msg.id); }}
                className={`w-full text-left bg-white rounded-xl border p-4 transition-colors ${
                  selected?.id === msg.id ? "border-accent" : "border-border"
                } ${!msg.isRead ? "border-l-4 border-l-accent" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-primary">{msg.name}</span>
                  <span className="text-xs text-muted">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted">{msg.email}</p>
                {msg.subject && <p className="text-xs text-body mt-1">{msg.subject}</p>}
              </button>
            ))
          )}
        </div>

        {selected && (
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif text-primary">{selected.name}</h2>
              <button onClick={() => handleDelete(selected.id)} className="text-xs text-red-500 hover:underline">
                Delete
              </button>
            </div>
            <p className="text-xs text-muted mb-1">{selected.email}</p>
            {selected.subject && (
              <p className="text-sm text-body font-medium mb-3">{selected.subject}</p>
            )}
            <p className="text-xs text-muted mb-4">
              {new Date(selected.createdAt).toLocaleString()}
            </p>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-body whitespace-pre-line leading-relaxed">
                {selected.message}
              </p>
            </div>
            <div className="mt-4">
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject || ""}`}
                className="text-sm text-accent hover:underline"
              >
                Reply via Email
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
