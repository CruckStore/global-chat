export type Role = "member" | "premium" | "admin";
export interface User {
  userId: string;
  pseudo: string;
  role: Role;
}
export interface Message {
  id: number;
  user_id: string;
  pseudo: string;
  content: string;
  timestamp: string;
  edited: boolean;
  parent_id: number | null;
}

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API + url, init);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function login(pseudo: string, userId?: string): Promise<User> {
  return request<User>("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pseudo, userId }),
  });
}

export function getMessages(): Promise<Message[]> {
  return request<Message[]>("/api/messages");
}

export function postMessage(
  content: string,
  parentId?: number
): Promise<Message> {
  const u = JSON.parse(localStorage.getItem("chat_user")!);
  return request<Message>("/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "user-id": u.userId,
    },
    body: JSON.stringify({ content, parentId }),
  });
}

export function editMessage(id: number, content: string): Promise<void> {
  const u = JSON.parse(localStorage.getItem("chat_user")!);
  return request<void>(`/api/messages/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "user-id": u.userId,
    },
    body: JSON.stringify({ content }),
  });
}

export function deleteMessage(id: number): Promise<void> {
  const u = JSON.parse(localStorage.getItem("chat_user")!);
  return request<void>(`/api/messages/${id}`, {
    method: "DELETE",
    headers: { "user-id": u.userId },
  });
}
