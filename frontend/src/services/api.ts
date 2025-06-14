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

export interface OnlineUser {
  user_id: string;
  pseudo: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}
function getAuthHeaders() {
  const stored = localStorage.getItem("chat_user");
  if (!stored) throw new Error("Utilisateur non connecté");
  const { userId } = JSON.parse(stored) as { userId: string };
  return { "user-id": userId };
}

export function getStats(): Promise<Stats> {
  return request<Stats>("/api/stats", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export function getOnlineUsers(): Promise<OnlineUser[]> {
  return request<OnlineUser[]>("/api/online", {
    method: "GET",
    headers: getAuthHeaders(),
  });
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
  const body = userId ? { pseudo, userId } : { pseudo };
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 409) {
      throw new Error("Ce pseudo est déjà pris, choisissez-en un autre.");
    }
    throw new Error(data.error || res.statusText);
  }

  if (res.status === 201) {
    window.alert(
      `🎉 Bienvenue, ${data.pseudo} !\n\n` +
        `Votre identifiant unique est : ${data.userId}\n\n` +
        `Conservez-le précieusement ! ` +
        `Si vous perdez votre session, utilisez cet identifiant pour vous reconnecter.`
    );
  }

  return data as User;
}

export function banUser(userId: string): Promise<void> {
  return request<void>(`/api/ban/${userId}`, {
    method: "POST",
    headers: {
      "user-id": JSON.parse(localStorage.getItem("chat_user")!).userId,
    },
  });
}
export function getMessages(): Promise<Message[]> {
  return request<Message[]>("/api/messages", {
    method: "GET",
  });
}

export interface Stats {
  total: number;
  online: number;
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
