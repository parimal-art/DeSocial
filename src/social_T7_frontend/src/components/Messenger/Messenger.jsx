import React, { useEffect, useMemo, useRef, useState } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

export default function Messenger({ actor, user }) {
  const [peers, setPeers] = useState([]);
  const [activePeer, setActivePeer] = useState(null);
  const [isMobileChat, setIsMobileChat] = useState(false); // mobile default = list
  const [me, setMe] = useState(user);
  const timer = useRef(null);

  const loadInbox = async () => {
    try {
      const list = await actor.get_inbox();
      setPeers(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("get_inbox failed", e);
    }
  };

  const loadMe = async () => {
    try {
      const myP = user?.user_principal;
      if (!myP) return;
      const res = await actor.get_user(myP);
      const u = res && res[0] ? { ...res[0], user_principal: myP } : me;
      setMe(u || me);
    } catch (e) {
      console.error("get_user(self) failed", e);
    }
  };

  const refreshAll = async () => {
    await Promise.all([loadInbox(), loadMe()]);
  };

  useEffect(() => {
    // mobile: start with list view visible
    if (typeof window !== "undefined" && window.innerWidth < 576) {
      setIsMobileChat(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
    // poll inbox lightly
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(loadInbox, 5000);
    return () => timer.current && clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (p) => {
    setActivePeer(p);
    // mobile switch to chat pane
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsMobileChat(true);
    }
  };

  const handleBackToList = () => setIsMobileChat(false);

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

      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[360px,1fr]">
          {/* LEFT: list */}
          <div className={isMobileChat && !isDesktop ? "hidden md:block" : "block"}>
            <ConversationList
              actor={actor}
              user={me}
              peers={peers}
              activePeer={activePeer}
              onSelect={handleSelect}
              onRefresh={refreshAll} // refresh me + inbox after follow
            />
          </div>

          {/* RIGHT: thread */}
          <div
            className={
              (!isMobileChat && !isDesktop)
                ? "hidden md:block"
                : "block md:border-l md:border-gray-200"
            }
          >
            <ChatWindow
              actor={actor}
              user={me}
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
