const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface TangolabUser {
  id: string;
  nama: string;
  nim?: string;
  coin_balance: number;
  avatar_url?: string;
  rfid_tag_id?: string;
}

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
    const response = await fetch(`${API_BASE_URL}/api/tangolab/users/${encodeURIComponent(userId)}/recommendations`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('getRecommendations failed:', error);
    return null;
  }
}

export async function scanRFIDTag(tagId: string): Promise<{ status: string; user: TangolabUser } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tangolab/users/scan-tag/${encodeURIComponent(tagId)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('scanRFIDTag failed:', error);
    return null;
  }
}

export async function getAllUsers(): Promise<TangolabUser[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tangolab/users`);
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
    const response = await fetch(`${API_BASE_URL}/api/tangolab/users/login`, {
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
    const response = await fetch(`${API_BASE_URL}/api/tangolab/users/register`, {
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
    const response = await fetch(`${API_BASE_URL}/api/tangolab/users/${encodeURIComponent(userId)}/earn-coins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${API_BASE_URL}/api/tangolab/users/transactions?user_id=${encodeURIComponent(userId)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : (data.transactions || []);
  } catch (error) {
    console.error('getTransactionHistory failed:', error);
    return [];
  }
}

export async function getCoinPromosCatalog(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tangolab/coin-promos`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('getCoinPromosCatalog failed:', error);
    return [];
  }
}

export async function redeemCoinVoucher(
  userId: string,
  promoId: string
): Promise<{ status: string; message: string; data?: { voucher_code: string; promo_id: string; new_balance: number } } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tangolab/coin-promos/${encodeURIComponent(promoId)}/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    return await response.json();
  } catch (error) {
    console.error('redeemCoinVoucher failed:', error);
    return null;
  }
}

export async function claimPromoCode(
  userId: string,
  promoCode: string
): Promise<{ status: string; message: string; data?: any } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tangolab/coin-promos/claim-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, promo_code: promoCode }),
    });
    return await response.json();
  } catch (error) {
    console.error('claimPromoCode failed:', error);
    return null;
  }
}

export async function getUserVouchers(userId: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tangolab/coin-promos/user-vouchers/${encodeURIComponent(userId)}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('getUserVouchers failed:', error);
    return [];
  }
}

export async function validateVoucher(
  userId: string,
  voucherCode: string,
  totalPrice: number,
  items: any[] = []
): Promise<{ status: string; message?: string; discount_amount?: number; final_price?: number; discount?: string } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tangolab/coin-promos/validate-voucher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, voucher_code: voucherCode, total_price: totalPrice, items }),
    });
    return await response.json();
  } catch (error) {
    console.error('validateVoucher failed:', error);
    return null;
  }
}

export async function useVoucher(
  userId: string,
  voucherCode: string
): Promise<{ status: string; message?: string } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tangolab/coin-promos/use-voucher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, voucher_code: voucherCode }),
    });
    return await response.json();
  } catch (error) {
    console.error('useVoucher failed:', error);
    return null;
  }
}
