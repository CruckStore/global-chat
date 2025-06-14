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

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    const errorMessage = text || res.statusText;
    throw new Error(errorMessage);
  }

  return (await res.json()) as T;
}

export async function login(pseudo: string, userId?: string): Promise<User> {
  try {
    const body = userId ? { pseudo, userId } : { pseudo };
    return await request<User>("/api/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (e: any) {
    if (e.message.includes("409")) {
      throw new Error("Ce pseudo est déjà pris, choisissez-en un autre.");
    }
    throw e;
  }
}

export function getMessages(): Promise<Message[]> {
  return request<Message[]>("/api/messages", {
    method: "GET",
  });
}

export function postMessage(
  content: string,
  parentId?: number
): Promise<Message> {
  const stored = localStorage.getItem("chat_user");
  if (!stored) {
    return Promise.reject(new Error("Utilisateur non connecté"));
  }
  const { userId } = JSON.parse(stored) as User;
  return request<Message>("/api/messages", {
    method: "POST",
    headers: { "user-id": userId },
    body: JSON.stringify({ content, parentId }),
  });
}

export function editMessage(id: number, content: string): Promise<void> {
  const stored = localStorage.getItem("chat_user");
  if (!stored) {
    return Promise.reject(new Error("Utilisateur non connecté"));
  }
  const { userId } = JSON.parse(stored) as User;
  return request<void>(`/api/messages/${id}`, {
    method: "PUT",
    headers: { "user-id": userId },
    body: JSON.stringify({ content }),
  });
}

export function deleteMessage(id: number): Promise<void> {
  const stored = localStorage.getItem("chat_user");
  if (!stored) {
    return Promise.reject(new Error("Utilisateur non connecté"));
  }
  const { userId } = JSON.parse(stored) as User;
  return request<void>(`/api/messages/${id}`, {
    method: "DELETE",
    headers: { "user-id": userId },
  });
}
