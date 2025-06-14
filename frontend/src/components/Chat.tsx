import React, { useState, useEffect } from "react";
import "./Chat.css";
import {
  login,
  getMessages,
  postMessage,
  editMessage,
  deleteMessage,
  Message,
  User,
} from "../services/api";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const POLL_INTERVAL = 2000;

const Chat: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [pseudo, setPseudo] = useState("");

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

  useEffect(() => {
    if (!user) return;
    const load = () => getMessages().then(setMsgs).catch(console.error);
    load();
    const timer = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [user]);

  const handleLogin = async () => {
    try {
      const u = await login(pseudo.trim());
      setUser(u);
      localStorage.setItem("chat_user", JSON.stringify(u));
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleSend = async (content: string, parentId?: number) => {
    try {
      await postMessage(content, parentId);
      setMsgs(await getMessages());
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

  if (!user) {
    return (
      <div className="chat-login">
        <h2>Se connecter</h2>
        <input
          type="text"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          placeholder="Votre pseudo"
        />
        <button onClick={handleLogin} disabled={!pseudo.trim()}>
          Entrer
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        Chat Général — Vous êtes <em>{user.pseudo}</em> ({user.role})
      </header>
      <main className="message-list">
        <MessageList
          messages={msgs}
          currentUser={user}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReply={handleSend}
        />
      </main>
      <footer className="message-input-container">
        <MessageInput onSend={handleSend} />
      </footer>
    </div>
  );
};

export default Chat;
