import React, { useEffect, useState, useRef, useMemo } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

export default function Messenger({ actor, user }) {
  const [peers, setPeers] = useState([]);
  const [activePeer, setActivePeer] = useState(null);
  const [isMobileChat, setIsMobileChat] = useState(false); // mobile: whether we’re showing chat view
  const timer = useRef(null);

  const loadInbox = async () => {
    try {
      const list = await actor.get_inbox();
      setPeers(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
    }
  };

  // initial + poll
  useEffect(() => {
    loadInbox();
    timer.current && clearInterval(timer.current);
    timer.current = setInterval(loadInbox, 5000);
    return () => timer.current && clearInterval(timer.current);
  }, []);

  // when you select a peer on mobile, switch to chat pane
  const handleSelect = (p) => {
    setActivePeer(p);
    setIsMobileChat(true);
  };

  const handleBackToList = () => setIsMobileChat(false);

  // snapshot of whether we’re on desktop (for class toggles)
  const isDesktop = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 768px)").matches; // md
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <div className="pt-6 pb-4">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="text-sm text-gray-500">Chat with people you follow or who follow you</p>
      </div>

      {/* Desktop: grid; Mobile: we toggle which pane is visible */}
      <div className="relative pb-10">
        {/* LIST CARD */}
        <div
          className={[
            "bg-white border rounded-2xl shadow-sm overflow-hidden",
            "md:grid md:grid-cols-1 md:col-span-4 md:static",
            // mobile visibility: show list if not in chat
            isMobileChat && !isDesktop ? "hidden" : "block",
          ].join(" ")}
        >
          <ConversationList
            actor={actor}
            user={user}
            peers={peers}
            activePeer={activePeer}
            onSelect={handleSelect}
            onRefresh={loadInbox}
          />
        </div>

        {/* CHAT CARD */}
        <div
          className={[
            "bg-white border rounded-2xl shadow-sm overflow-hidden mt-6 md:mt-0",
            "md:absolute md:right-0 md:top-0 md:w-[66%]", // approximate md:col-span-8
            // mobile visibility: show chat when in chat mode
            isMobileChat || isDesktop ? "block" : "hidden",
          ].join(" ")}
        >
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
  );
}
