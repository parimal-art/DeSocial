import React, { useEffect, useMemo, useRef, useState } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

export default function Messenger({ actor, user }) {
  const [peers, setPeers] = useState([]);
  const [activePeer, setActivePeer] = useState(null);
  const [isMobileChat, setIsMobileChat] = useState(false);
  const timer = useRef(null);

  const loadInbox = async () => {
    try {
      const list = await actor.get_inbox();
      setPeers(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadInbox();
    timer.current && clearInterval(timer.current);
    timer.current = setInterval(loadInbox, 5000);
    return () => timer.current && clearInterval(timer.current);
  }, []);

  const handleSelect = (p) => {
    setActivePeer(p);
    setIsMobileChat(true);
  };
  const handleBackToList = () => setIsMobileChat(false);

  // only for mobile view toggling (desktop always shows both)
  const isDesktop = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 768px)").matches;
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <div className="pt-6 pb-4">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="text-sm text-gray-500">
          Chat with people you follow or who follow you
        </p>
      </div>

      {/* ✅ Desktop: pure grid (no absolute). Mobile: toggle which pane to show */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[360px,1fr]">
          {/* LEFT: list (fixed width on md+) */}
          <div className={isMobileChat && !isDesktop ? "hidden md:block" : "block"}>
            <ConversationList
              actor={actor}
              user={user}
              peers={peers}
              activePeer={activePeer}
              onSelect={handleSelect}
              onRefresh={loadInbox}
            />
          </div>

          {/* RIGHT: thread (gets the divider) */}
          <div className={(!isMobileChat && !isDesktop) ? "hidden md:block" : "block md:border-l md:border-gray-200"}>
            <ChatWindow
              actor={actor}
              user={user}
              peer={activePeer}
              onBack={handleBackToList}
              isMobileChat={isMobileChat && !isDesktop}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
