import React, { useEffect, useState } from "react";
import { getOnlineUsers, banUser, OnlineUser } from "../services/api";
import type { User } from "../services/api";

interface Props {
  currentUser: User;
}

export default function OnlineList({ currentUser }: Props) {
  const [list, setList] = useState<OnlineUser[]>([]);

  const loadList = () => {
    getOnlineUsers().then(setList).catch(console.error);
  };

  useEffect(() => {
    loadList();
    const timer = setInterval(loadList, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <aside className="online-list">
      <h3>En ligne</h3>
      <ul>
        {list.map((u) => (
          <li key={u.user_id}>
            {u.pseudo}
            {currentUser.role === "admin" &&
              u.user_id !== currentUser.userId && (
                <button
                  className="btn-ban"
                  onClick={() => {
                    if (window.confirm(`Bannir ${u.pseudo} ?`)) {
                      banUser(u.user_id)
                        .then(() => loadList())
                        .catch(console.error);
                    }
                  }}
                >
                  Ban
                </button>
              )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
