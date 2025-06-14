import React, { useState, useEffect, useRef } from "react";
import "./Chat.scss";
import {
  login,
  getMessages,
  postMessage,
  getStats,
  editMessage,
  deleteMessage,
  Message,
  Stats,
  User,
} from "../services/api";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import OnlineList from "./OnlineList";

const POLL_INTERVAL = 100;
const STATS_INTERVAL = 5000;

const Chat: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pseudo, setPseudo] = useState("");
  const [savedUserId, setSavedUserId] = useState("");
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, online: 0 });
  const listRef = useRef<HTMLDivElement>(null);
  const prevLastMsgId = useRef<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("chat_user");
    if (stored) {
      const u = JSON.parse(stored) as User;
      login(u.pseudo, u.userId)
        .then((u2) => {
          setUser(u2);
          localStorage.setItem("chat_user", JSON.stringify(u2));
        })
        .catch(() => {
          localStorage.removeItem("chat_user");
        });
    }
  }, []);

  // polling messages
  useEffect(() => {
    if (!user) return;
    const load = () => getMessages().then(setMsgs).catch(console.error);
    load();
    const timer = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [user]);

  useEffect(() => {
    if (!listRef.current) return;
    const last = msgs[msgs.length - 1];
    const lastId = last ? last.id : null;
    if (lastId !== prevLastMsgId.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
      prevLastMsgId.current = lastId;
    }
  }, [msgs]);

  // polling stats
  useEffect(() => {
    if (!user) return;
    const loadStats = () => getStats().then(setStats).catch(console.error);
    loadStats();
    const timer = setInterval(loadStats, STATS_INTERVAL);
    return () => clearInterval(timer);
  }, [user]);

  const handleLogin = async () => {
    try {
      const u = await login(pseudo.trim(), savedUserId.trim() || undefined);
      setUser(u);
      localStorage.setItem("chat_user", JSON.stringify(u));
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const initiateReply = (message: Message) => {
    setReplyTo(message);
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleSend = async (content: string, parentId?: number) => {
    try {
      await postMessage(content, parentId);
      setMsgs(await getMessages());
      setReplyTo(null);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleEdit = async (id: number, content: string) => {
    try {
      await editMessage(id, content);
      setMsgs(await getMessages());
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirmer suppression ?")) return;
    try {
      await deleteMessage(id);
      setMsgs(await getMessages());
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  if (!user) {
    return (
      <form
        className="chat-login"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <h2>Se connecter</h2>
        <input
          type="text"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          placeholder="Votre pseudo"
        />
        <input
          type="text"
          value={savedUserId}
          onChange={(e) => setSavedUserId(e.target.value)}
          placeholder="Votre ID (optionnel)"
        />
        <button type="submit" disabled={!pseudo.trim()}>
          Entrer
        </button>
      </form>
    );
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        Chat Général — Vous êtes <em>{user.pseudo}</em> ({user.role})
        <div className="chat-stats">
          <span>🟢 En ligne : {stats.online}</span>
          <span>👥 Inscrits : {stats.total}</span>
        </div>
      </header>

      <div className="chat-body">
        <main className="message-list" ref={listRef}>
          <MessageList
            messages={msgs}
            currentUser={user}
            onReplyInitiate={initiateReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </main>
        <OnlineList currentUser={user} />
      </div>

      <footer className="message-input-container">
        <MessageInput
          onSend={handleSend}
          parentMessage={replyTo}
          onCancelReply={cancelReply}
        />
      </footer>
    </div>
  );
};

export default Chat;
