import React, { useEffect, useMemo, useState } from "react";

export default function ConversationList({
  actor,
  user,
  peers,
  activePeer,
  onSelect,
  onRefresh,
}) {
  const [profiles, setProfiles] = useState({});
  const [starterProfiles, setStarterProfiles] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [followLoading, setFollowLoading] = useState({});

  const myPrincipalKey = user?.user_principal?.toString();
  const peerKeys = useMemo(() => peers.map((p) => p.toString()), [peers]);

  // followers ∪ following − peers
  const startersPrincipals = useMemo(() => {
    const merged = [...(user?.followers || []), ...(user?.following || [])];
    const seen = new Set();
    const deduped = [];
    for (const p of merged) {
      const k = p.toString();
      if (!seen.has(k)) {
        seen.add(k);
        deduped.push(p);
      }
    }
    return deduped.filter((p) => !peerKeys.includes(p.toString()));
  }, [user?.followers, user?.following, peerKeys]);

  const starterKeys = useMemo(
    () => startersPrincipals.map((p) => p.toString()),
    [startersPrincipals]
  );

  useEffect(() => {
    (async () => {
      const map = {};
      for (const p of peers) {
        try {
          const res = await actor.get_user(p);
          if (res && res[0]) map[p.toString()] = res[0];
        } catch {}
      }
      setProfiles(map);
    })();
  }, [actor, peers]);

  useEffect(() => {
    (async () => {
      if (!startersPrincipals.length) {
        setStarterProfiles({});
        return;
      }
      const map = {};
      for (const p of startersPrincipals) {
        try {
          const res = await actor.get_user(p);
          if (res && res[0]) map[p.toString()] = res[0];
        } catch {}
      }
      setStarterProfiles(map);
    })();
  }, [actor, startersPrincipals]);

  useEffect(() => {
    (async () => {
      try {
        const res = await actor.get_all_users();
        setAllUsers(Array.isArray(res) ? res : []);
      } catch {
        setAllUsers([]);
      }
    })();
  }, [actor]);

  const connectionKeySet = useMemo(() => {
    const s = new Set();
    for (const p of user?.followers || []) s.add(p.toString());
    for (const p of user?.following || []) s.add(p.toString());
    return s;
  }, [user?.followers, user?.following]);

  const discoverUsers = useMemo(() => {
    return allUsers
      .filter((u) => {
        const k = u.user_principal.toString();
        if (k === myPrincipalKey) return false;
        if (peerKeys.includes(k)) return false;
        if (connectionKeySet.has(k)) return false;
        return true;
      })
      .slice(0, 30);
  }, [allUsers, myPrincipalKey, peerKeys, connectionKeySet]);

  const handleFollow = async (targetPrincipal) => {
    const key = targetPrincipal.toString();
    if (followLoading[key]) return;
    setFollowLoading((m) => ({ ...m, [key]: true }));
    try {
      await actor.follow_user(targetPrincipal);
      if (user) user.following = [...(user.following || []), targetPrincipal];
      onRefresh && onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setFollowLoading((m) => ({ ...m, [key]: false }));
    }
  };

  // Mobile-friendly full height using 100svh; desktop matches card height
  return (
    <div className="flex flex-col h-[calc(100svh-220px)] md:h-[calc(100vh-220px)]">
      {/* Sticky header */}
      <div className="p-4 border-b font-semibold flex items-center justify-between bg-white sticky top-0 z-10">
        <span>Messages</span>
        <button onClick={onRefresh} className="text-sm text-blue-600">
          Refresh
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Existing conversations */}
        {peers.length > 0 ? (
          peers.map((p) => {
            const key = p.toString();
            const prof = profiles[key];
            return (
              <button
                key={key}
                onClick={() => onSelect(p)}
                className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 ${
                  activePeer && activePeer.toString() === key ? "bg-blue-50" : ""
                }`}
                aria-label={`Open chat with ${prof?.name || key.slice(0, 8)}`}
              >
                <img
                  className="w-10 h-10 rounded-full border object-cover"
                  src={prof?.profile_image || "/no-profile.jpg"}
                  alt=""
                />
                <div className="text-left">
                  <div className="font-medium truncate max-w-[160px] md:max-w-[220px]">
                    {prof?.name || key.slice(0, 8) + "..."}
                  </div>
                  <div className="text-xs text-gray-500">@{key.slice(0, 12)}</div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-4 text-sm text-gray-500">No conversations yet.</div>
        )}

        {/* Start a new chat */}
        <div className="p-4 pt-2">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
            Start a new chat
          </div>

          {starterKeys.map((key) => {
            const prof = starterProfiles[key];
            const p = startersPrincipals.find((pp) => pp.toString() === key);
            return (
              <button
                key={key}
                onClick={() => onSelect(p)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <img
                  className="w-8 h-8 rounded-full border object-cover"
                  src={prof?.profile_image || "/no-profile.jpg"}
                  alt=""
                />
                <div className="text-left">
                  <div className="text-sm font-medium truncate max-w-[180px]">
                    {prof?.name || key.slice(0, 8) + "..."}
                  </div>
                  <div className="text-[11px] text-gray-500">@{key.slice(0, 12)}</div>
                </div>
                <span className="ml-auto text-xs px-2 py-1 rounded-full border">
                  Message
                </span>
              </button>
            );
          })}
        </div>

        {/* Discover */}
        <div className="px-4 pb-6">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
            Start conversation by following them
          </div>

          {discoverUsers.length === 0 ? (
            <div className="text-sm text-gray-500">
              Looks like you’re connected with everyone here. Try searching users elsewhere.
            </div>
          ) : (
            discoverUsers.map((u) => {
              const key = u.user_principal.toString();
              const busy = !!followLoading[key];
              return (
                <div
                  key={key}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <img
                    className="w-8 h-8 rounded-full border object-cover"
                    src={u.profile_image || "/no-profile.jpg"}
                    alt=""
                  />
                  <div className="text-left">
                    <div className="text-sm font-medium truncate max-w-[180px]">
                      {u.name || key.slice(0, 8) + "..."}
                    </div>
                    <div className="text-[11px] text-gray-500">@{key.slice(0, 12)}</div>
                  </div>
                  <button
                    onClick={() => handleFollow(u.user_principal)}
                    disabled={busy}
                    className={`ml-auto text-xs px-3 py-1 rounded-full border ${
                      busy ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-100"
                    }`}
                    title="Follow to enable messaging"
                  >
                    {busy ? "Following..." : "Follow to message"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
