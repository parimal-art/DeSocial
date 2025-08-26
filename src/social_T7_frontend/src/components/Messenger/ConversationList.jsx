import React, { useEffect, useMemo, useState } from "react";

/**
 * Props:
 *  - actor: { get_user, get_all_users, follow_user }
 *  - user:  { user_principal, followers: Principal[], following: Principal[] }
 *  - peers: Principal[]
 *  - activePeer: Principal | null
 *  - onSelect: (principal) => void
 *  - onRefresh: () => void
 */
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

  const myKey = user?.user_principal?.toString() || "";
  const peerKeys = useMemo(() => peers.map((p) => p.toString()), [peers]);

  // people you follow OR who follow you, but not already in peers list
  const startersPrincipals = useMemo(() => {
    const merged = [...(user?.followers || []), ...(user?.following || [])];
    const seen = new Set();
    const out = [];
    for (const p of merged) {
      const k = p.toString();
      if (!seen.has(k)) {
        seen.add(k);
        out.push(p);
      }
    }
    return out.filter((p) => !peerKeys.includes(p.toString()));
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

  const followingKeys = useMemo(() => {
    const s = new Set();
    for (const p of user?.following || []) s.add(p.toString());
    return s;
  }, [user?.following]);

  // users you could follow to start a conversation
  const discoverUsers = useMemo(() => {
    return (allUsers || [])
      .filter((u) => {
        const k = u.user_principal.toString();
        if (k === myKey) return false;
        if (peerKeys.includes(k)) return false;
        if (followingKeys.has(k)) return false;
        return true;
      })
      .slice(0, 30);
  }, [allUsers, myKey, peerKeys, followingKeys]);

  const handleFollow = async (principal) => {
    const key = principal.toString();
    if (followLoading[key]) return;
    setFollowLoading((m) => ({ ...m, [key]: true }));
    try {
      await actor.follow_user(principal);
      // optimistic: remove from discover immediately
      setAllUsers((arr) => arr.filter((u) => u.user_principal.toString() !== key));
      onRefresh && onRefresh(); // parent reloads me + inbox
    } catch (e) {
      console.error("follow_user failed", e);
    } finally {
      setFollowLoading((m) => ({ ...m, [key]: false }));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100svh-220px)] md:h-[calc(100vh-220px)] md:w-[360px] md:max-w-[360px] md:flex-none md:pr-4">
      <div className="p-4 border-b font-semibold flex items-center justify-between bg-white sticky top-0 z-10">
        <span>Messages</span>
        <button onClick={onRefresh} className="text-sm text-blue-600">
          Refresh
        </button>
      </div>

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
                  className="w-10 h-10 rounded-full border object-cover shrink-0"
                  src={prof?.profile_image || "/no-profile.jpg"}
                  alt=""
                />
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium truncate">
                    {prof?.name || key.slice(0, 8) + "..."}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    @{key.slice(0, 12)}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-4 text-sm text-gray-500">No conversations yet.</div>
        )}

        {/* Quick start with followers/following */}
        <div className="p-4 pt-2">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
            Start a new chat
          </div>

          {starterKeys.map((key) => {
            const prof = starterProfiles[key];
            const p = startersPrincipals.find((pp) => pp.toString() === key);
            return (
              <div
                key={key}
                className="w-full grid grid-cols-[2.25rem,1fr] items-center gap-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <img
                  className="w-9 h-9 rounded-full border object-cover shrink-0 col-start-1 row-span-2"
                  src={prof?.profile_image || "/no-profile.jpg"}
                  alt=""
                />
                <div className="col-start-2 min-w-0 text-left">
                  <div className="text-sm font-medium truncate">
                    {prof?.name || key.slice(0, 8) + "..."}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    @{key.slice(0, 12)}
                  </div>
                </div>
                <div className="col-start-2 mt-1">
                  <button
                    className="text-xs px-3 py-1 rounded-full border hover:bg-gray-100"
                    onClick={() => onSelect(p)}
                    title="Start chat"
                  >
                    Message
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* DISCOVER / FOLLOW TO MESSAGE */}
        <div className="px-4 pb-6">
          {(() => {
            const eligibleCount = (allUsers || []).filter((u) => {
              const k = u.user_principal.toString();
              return k !== myKey && !peerKeys.includes(k);
            }).length;

            const noneLeftToFollow =
              eligibleCount > 0 && discoverUsers.length === 0;

            if (noneLeftToFollow) {
              return (
                <div className="text-sm text-gray-500">
                  Looks like you’re connected with everyone.
                </div>
              );
            }

            if (discoverUsers.length === 0) {
              return null;
            }

            return (
              <>
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  Start conversation by following a user
                </div>
                {discoverUsers.map((u) => {
                  const key = u.user_principal.toString();
                  const busy = !!followLoading[key];
                  return (
                    <div
                      key={key}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <img
                        className="w-9 h-9 rounded-full border object-cover shrink-0"
                        src={u.profile_image || "/no-profile.jpg"}
                        alt=""
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {u.name || key.slice(0, 8) + "..."}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">
                          @{key.slice(0, 12)}
                        </div>
                      </div>

                      {/* 👇 button inline right side */}
                      <button
                        onClick={() => handleFollow(u.user_principal)}
                        disabled={busy}
                        className={`text-xs px-3 py-1 rounded-full border ml-2 shrink-0 ${
                          busy
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }`}
                        title="Follow to enable messaging"
                      >
                        {busy ? "Following..." : "Follow to message"}
                      </button>
                    </div>
                  );
                })}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
