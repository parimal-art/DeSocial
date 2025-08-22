import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ actor, user, peer, onBack, isMobileChat }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const timer = useRef(null);
  const bottomRef = useRef(null);

  const meStr = user?.user_principal?.toString?.() || "";

  const unwrap = (res) => (Array.isArray(res) ? res : (res?.Ok ?? res ?? []));
  const toBig = (v) => (typeof v === "bigint" ? v : BigInt(Number(v || 0)));

  const load = async () => {
    if (!peer) return;
    try {
      const raw = await actor.get_conversation(peer);
      const list = unwrap(raw) || [];
      const arr = Array.isArray(list) ? list : [];
      setMessages(arr);

      const incoming = arr.filter((m) => m?.to?.toString?.() === meStr);
      if (incoming.length > 0) {
        const last = incoming[incoming.length - 1];
        await actor.mark_seen(peer, toBig(last?.id));
      }
    } catch (e) {
      console.error("load conversation error", e);
    }
  };

  useEffect(() => {
    load();
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(load, 3000);
    return () => timer.current && clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peer?.toString?.()]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !peer) return;
    try {
      const res = await actor.send_message(peer, text.trim());
      if (res?.Err) {
        alert(res.Err);
        return;
      }
      setText("");
      await load();
    } catch (e) {
      console.error("send error", e);
      alert("Failed to send message. Check follower relationship and try again.");
    }
  };

  // heights for mobile/desktop, avoid attaching to top
  const wrapHeight = "h-[calc(100svh-220px)] md:h-[calc(100vh-220px)]";

  if (!peer) {
    return (
      <div className={`${wrapHeight} flex items-center justify-center text-gray-500`}>
        Select a conversation
      </div>
    );
    }

  const listSafe = Array.isArray(messages) ? messages : [];

  return (
    <div className={`flex flex-col ${wrapHeight}`}>
      {/* Sticky header */}
      <div className="p-4 border-b font-medium bg-white sticky top-0 z-10 flex items-center gap-2">
        {/* Mobile back */}
        {isMobileChat && (
          <button
            onClick={onBack}
            className="mr-1 inline-flex items-center justify-center rounded-lg border px-2 py-1 text-xs hover:bg-gray-50 md:hidden"
            aria-label="Back to conversations"
          >
            ← Back
          </button>
        )}
        <span>Chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
        {listSafe.map((m) => (
          <MessageBubble key={String(m.id)} msg={m} meStr={meStr} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar (always visible) */}
      <form onSubmit={send} className="p-2 sm:p-3 border-t flex gap-2 bg-white sticky bottom-0">
        <input
          className="flex-1 border rounded-xl px-3 sm:px-4 py-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          aria-label="Type a message"
        />
        <button className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-xl">
          Send
        </button>
      </form>
    </div>
  );
}
