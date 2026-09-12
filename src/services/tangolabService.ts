import type { PromoKoin } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function authHeaders(): HeadersInit {
  try {
    const user = JSON.parse(localStorage.getItem('maslahat_user') || 'null');
    const token = user?.token || user?.access_token || user?.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export interface TangolabUser {
  id: string;
  nama: string;
  nim?: string;
  coin_balance: number;
  avatar_url?: string;
  rfid_tag_id?: string;
}

export const DUMMY_LOGIN_USER: TangolabUser & { email: string } = {
  id: 'DEMO001',
  nama: 'Pengguna Demo',
  nim: '1234567890',
  email: 'demo@ngolab.test',
  coin_balance: 1000,
  avatar_url: '',
};

export interface Recommendation {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  description: string;
}

export interface CoinTransaction {
  id: string;
  amount: number;
  type: 'earn' | 'redeem' | string;
  description: string;
  timestamp?: string;
}

export async function getRecommendations(userId: string): Promise<{ user: TangolabUser; recommendations: any[] } | null> {
  try {
    const response = await globalThis.fetch(`${API_BASE_URL}/api/tangolab/users/${encodeURIComponent(userId)}/recommendations`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('getRecommendations failed:', error);
    return null;
  }
}

export async function scanRFIDTag(tagId: string): Promise<{ status: string; user: TangolabUser } | null> {
  try {
    const response = await globalThis.fetch(`${API_BASE_URL}/api/tangolab/users/scan-tag/${encodeURIComponent(tagId)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('scanRFIDTag failed:', error);
    return null;
  }
}

export async function getAllUsers(): Promise<TangolabUser[]> {
  try {
    const response = await globalThis.fetch(`${API_BASE_URL}/api/tangolab/users`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('getAllUsers failed:', error);
    return [];
  }
}

/**
 * Validasi login berdasarkan input NIM atau User ID.
 * Mencocokkan dengan daftar user dari backend Tangolab.
 * Returns user jika ditemukan, null jika tidak.
 */
export async function validateUserLogin(
  input: string
): Promise<{ status: 'success' | 'error'; user?: TangolabUser; message?: string }> {
  const cleanInput = input.trim();
  const isDummyLogin = [DUMMY_LOGIN_USER.id, DUMMY_LOGIN_USER.nim, DUMMY_LOGIN_USER.email]
    .some((value) => value.toLowerCase() === cleanInput.toLowerCase());

  if (isDummyLogin) {
    return { status: 'success', user: DUMMY_LOGIN_USER };
  }

  const users = await getAllUsers();

  if (users.length === 0) {
    return { status: 'error', message: 'Tidak dapat terhubung ke server. Coba lagi.' };
  }

  const found = users.find(
    (u) =>
      u.id?.toString().toLowerCase() === cleanInput.toLowerCase() ||
      (u as any).nim?.toString().toLowerCase() === cleanInput.toLowerCase()
  );

  if (found) {
    return { status: 'success', user: found };
  }

  return { status: 'error', message: 'ID atau NIM tidak ditemukan. Periksa kembali input Anda.' };
}

export async function loginUser(id: string): Promise<{ status: string; user?: TangolabUser; message?: string } | null> {
  try {
    const response = await globalThis.fetch(`${API_BASE_URL}/api/tangolab/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('loginUser failed:', error);
    return null;
  }
}


export async function registerUser(user: {
  id: string;
  nama: string;
  nim: string;
  email: string;
  phone: string;
}): Promise<{ status: string; message?: string } | null> {
  try {
    const response = await globalThis.fetch(`${API_BASE_URL}/api/tangolab/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    return await response.json();
  } catch (error) {
    console.error('registerUser failed:', error);
    return null;
  }
}

export async function earnCoins(
  userId: string,
  amount: number,
  description: string
): Promise<{ message: string; new_balance: number; transaction: CoinTransaction } | null> {
  try {
    const response = await globalThis.fetch(`${API_BASE_URL}/api/tangolab/users/${encodeURIComponent(userId)}/earn-coins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ amount, description }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('earnCoins failed:', error);
    return null;
  }
}

export async function getTransactionHistory(userId: string): Promise<CoinTransaction[]> {
  try {
    const response = await globalThis.fetch(`${API_BASE_URL}/api/tangolab/users/transactions?user_id=${encodeURIComponent(userId)}`, { headers: authHeaders() });
    if (!response.ok) return [];
    const data = await response.json();
    const transactions = Array.isArray(data)
      ? data
      : data.transactions || data.history || data.data?.transactions || data.data || [];

    return (Array.isArray(transactions) ? transactions : []).map((transaction: any, index: number) => ({
      id: String(transaction.id ?? transaction.transaction_id ?? `transaction-${index}`),
      amount: Math.abs(Number(transaction.amount ?? transaction.points ?? transaction.coin_amount ?? 0)),
      type: String(transaction.type ?? transaction.transaction_type ?? transaction.action ?? '').toLowerCase().includes('redeem') ||
        String(transaction.type ?? transaction.transaction_type ?? transaction.action ?? '').toLowerCase().includes('spend') ||
        String(transaction.type ?? transaction.transaction_type ?? transaction.action ?? '').toLowerCase().includes('debit')
        ? 'redeem'
        : 'earn',
      description: transaction.description ?? transaction.reason ?? transaction.source ?? transaction.note ?? 'Transaksi poin',
      timestamp: transaction.timestamp ?? transaction.created_at ?? transaction.date,
    }));
  } catch (error) {
    console.error('getTransactionHistory failed:', error);
    return [];
  }
}

