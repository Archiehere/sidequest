import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseUrl =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? 'http://localhost:4000';

const TOKEN_KEY = 'sidequest.token';
const USER_KEY = 'sidequest.user';

export type User = { id: string; phone: string; handle: string };

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setSession(token: string, user: User) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export type QuestMaterial = {
  id: string;
  productName: string;
  qty: number;
  optional: boolean;
  instamartProductId: string;
  product?: {
    id: string;
    name: string;
    imageUrl: string;
    pricePaise: number;
    unit: string;
    inStock: boolean;
  } | null;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  heroImageUrl: string;
  difficulty: string;
  estTimeMin: number;
  materials: QuestMaterial[];
  subtotalPaise?: number;
  _count?: { likes: number };
};

export const api = {
  requestOtp: (phone: string) =>
    request<{ devOtp: string }>('/auth/otp/request', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, otp: string, handle?: string) =>
    request<{ token: string; user: User }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, handle }),
    }),
  todaysDrop: () => request<Quest[]>('/quests/today'),
  getQuest: (id: string) => request<Quest>(`/quests/${id}`),
  like: (id: string) => request<{ liked: boolean; likeCount: number }>(`/quests/${id}/like`, { method: 'POST' }),
  checkout: (questId: string) =>
    request<{
      order: { id: string };
      basket: { id: string; totalPaise: number };
      checkoutUrl: string;
    }>('/orders/checkout', { method: 'POST', body: JSON.stringify({ questId }) }),
  myOrders: () =>
    request<Array<{ id: string; totalAmount: number; status: string; quest: { id: string; title: string; heroImageUrl: string } }>>('/orders/mine'),
};
