"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  body: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Props {
  requestId: string;
  currentUserId: string;
  initialMessages: Message[];
}

export default function MessageThread({
  requestId,
  currentUserId,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/messages/${requestId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [requestId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);

    try {
      const res = await fetch(`/api/messages/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newMessage.trim() }),
      });

      if (!res.ok) throw new Error("Failed to send");

      const message = await res.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch {
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[500px] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-center text-zinc-400 text-sm mt-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender.id.toString() === currentUserId.toString();
          console.log(
            "msg.sender.id:",
            msg.sender.id,
            "currentUserId:",
            currentUserId,
            "isMe:",
            isMe,
          );
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 max-w-[75%] ${
                isMe ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <span className="text-xs text-zinc-400">
                {isMe ? "You" : msg.sender.name || msg.sender.email}
              </span>
              <div
                className={`px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? "bg-purple-700 text-white rounded-br-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white rounded-bl-sm"
                }`}
              >
                {msg.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-3 flex gap-2">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          className="flex-1 resize-none border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleSend}
          disabled={sending || !newMessage.trim()}
          className="px-4 py-2 rounded-lg bg-purple-700 text-white text-sm font-medium hover:bg-purple-800 disabled:opacity-50 transition-colors"
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
