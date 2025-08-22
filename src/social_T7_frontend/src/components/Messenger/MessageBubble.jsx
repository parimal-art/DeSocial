// MessageBubble.jsx — robust text wrapping, responsive width, a11y ticks, safe time
import React, { useMemo } from "react";

const timeFmt = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" });
const fullFmt = new Intl.DateTimeFormat([], {
  year: "numeric", month: "short", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit"
});

export default function MessageBubble({ msg, meStr }) {
  const fromStr = msg?.from?.toString?.() || "";
  const mine = fromStr === (meStr || "");

  // created_at is ns (u64). Convert with BigInt, then to Number after dividing.
  const ms = useMemo(() => {
    try {
      const ns = typeof msg?.created_at === "bigint"
        ? msg.created_at
        : BigInt(Number(msg?.created_at ?? 0));
      const v = Number(ns / 1_000_000n); // ns -> ms
      return Number.isFinite(v) && v > 0 ? v : Date.now();
    } catch {
      return Date.now();
    }
  }, [msg?.created_at]);

  const timeStr = timeFmt.format(new Date(ms));
  const fullStr = fullFmt.format(new Date(ms));

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        dir="auto"
        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow break-words whitespace-pre-wrap ${
          mine ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
        }`}
        title={fullStr}
      >
        <div>{msg?.content ?? ""}</div>

        <div
          className={`mt-1 flex items-center gap-2 text-[10px] ${
            mine ? "text-blue-100" : "text-gray-500"
          }`}
        >
          <span>{timeStr}</span>

          {mine && (
            <span
              className={`inline-flex items-center gap-0.5 ${
                msg?.seen ? "text-blue-300" : ""
              }`}
              aria-label={msg?.seen ? "Seen" : "Sent"}
              title={msg?.seen ? "Seen" : "Sent"}
            >
              {/* double-tick icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M1.5 13.5l4 4 7-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15l3 3 7-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
