const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface SmartTagUser {
  id: number | string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  nim?: string;
  points: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: SmartTagUser;
}

export async function login(emailNim: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailNim, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data?.message || `Login gagal (HTTP ${response.status})` };
    }
    return data as LoginResponse;
  } catch (error) {
    console.error('login failed:', error);
    return { success: false, message: 'Terjadi kesalahan koneksi ke server.' };
  }
}

export async function registerUser(payload: { name: string; emailNim: string; phone: string; password: string }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        emailNim: payload.emailNim,
        phone: payload.phone,
        password: payload.password,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data?.message || `Registrasi gagal (HTTP ${response.status})` };
    }
    return data;
  } catch (error) {
    console.error('register failed:', error);
    return { success: false, message: 'Terjadi kesalahan koneksi ke server.' };
  }
}


import type { PromoKoin } from '../types';

function smartTagAuthHeaders(): HeadersInit {
  try {
    const user = JSON.parse(localStorage.getItem('maslahat_user') || 'null');
    const token = user?.token || user?.access_token || user?.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function getCoinPromosCatalog(): Promise<PromoKoin[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/point-rewards`, { headers: smartTagAuthHeaders() });
    if (!response.ok) return [];
    const payload = await response.json();
    const findRewardArray = (value: any): any[] => {
      if (Array.isArray(value)) return value;
      if (!value || typeof value !== 'object') return [];
      for (const key of ['rewards', 'items', 'data', 'results']) {
        const found = findRewardArray(value[key]);
        if (found.length > 0) return found;
      }
      return [];
    };
    const data = findRewardArray(payload);
    return data.map((promo: any, index: number) => ({
      id: String(promo.id ?? promo.reward_id ?? promo.promo_id ?? `reward-${index}-${promo.name ?? promo.title ?? 'item'}`),
      title: promo.title ?? promo.name ?? 'Promo Poin',
      description: promo.description ?? '',
      coin_cost: Number(promo.coin_cost ?? promo.points_cost ?? promo.points_required ?? promo.required_points ??
        promo.point_cost ?? promo.points_needed ?? promo.requiredPoints ?? promo.poin_dibutuhkan ?? promo.cost ?? promo.points ?? 0),
      discount_type: promo.discount_type ?? (promo.discount_price != null ? 'FIXED_AMOUNT' : 'PERCENTAGE'),
      discount_value: Number(promo.discount_value ?? promo.discount_price ?? promo.discount ?? 0),
      min_order: Number(promo.min_order ?? promo.minPurchase ?? 0),
      category: promo.category ?? 'Umum',
    }));
  } catch (error) {
    console.error('getCoinPromosCatalog failed:', error);
    return [];
  }
}

export async function getRewardRedeemStatus(promoId: string): Promise<boolean> {
  const userId = JSON.parse(localStorage.getItem('maslahat_user') || 'null')?.id || 'guest';
  const localKey = `maslahat_redeemed_rewards_${userId}`;
  const localStatuses: string[] = JSON.parse(localStorage.getItem(localKey) || '[]');
  if (localStatuses.includes(promoId)) return true;
  try {
    const response = await fetch(`${API_BASE_URL}/api/point-rewards/${encodeURIComponent(promoId)}/redeem-status`, {
      headers: smartTagAuthHeaders(),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.redeemed === true || data.has_redeemed === true || data.already_redeemed === true || data.data?.redeemed === true;
  } catch {
    return false;
  }
}

export function markRewardRedeemed(promoId: string): void {
  const userId = JSON.parse(localStorage.getItem('maslahat_user') || 'null')?.id || 'guest';
  const localKey = `maslahat_redeemed_rewards_${userId}`;
  const statuses: string[] = JSON.parse(localStorage.getItem(localKey) || '[]');
  localStorage.setItem(localKey, JSON.stringify([...new Set([...statuses, promoId])]));
}

export async function redeemCoinVoucher(
  userId: string,
  promoId: string
): Promise<{ status: string; message: string; data?: any } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/point-rewards/${encodeURIComponent(promoId)}/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...smartTagAuthHeaders() },
      body: JSON.stringify({
        user_id: userId,
        userId,
        promo_id: promoId,
        reward_id: promoId,
        point_reward_id: promoId,
      }),
    });
    const responseText = await response.text();
    const data = responseText && response.headers.get('content-type')?.includes('application/json')
      ? JSON.parse(responseText)
      : { message: responseText.startsWith('<!DOCTYPE') ? `Endpoint penukaran tidak ditemukan (HTTP ${response.status})` : responseText };
    if (!response.ok) {
      return { status: 'error', message: data?.message || data?.error || `Penukaran gagal (HTTP ${response.status})` };
    }
    const redemption = data.data?.redemption || data.data?.voucher || data.redemption || data.voucher || data.data || data;
    return {
      ...data,
      data: redemption,
      status: data.status || (data.success === true ? 'success' : 'error'),
      message: data.message || data.error || '',
    };
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
    const promos = await getSmartTagPromos();
    const promo = promos.find((item: any) => {
      const code = item.code ?? item.promo_code ?? item.voucher_code;
      return String(code || '').toUpperCase() === promoCode.toUpperCase();
    });
    return promo
      ? { status: 'success', message: 'Kode voucher valid.', data: { ...promo, voucher_code: promoCode.toUpperCase() } }
      : { status: 'error', message: 'Kode voucher tidak ditemukan di SmartTag.' };
  } catch (error) {
    console.error('claimPromoCode failed:', error);
    return null;
  }
}

// Simpan voucher hasil tukar poin ke localStorage
export function saveRedeemedVoucherToStorage(userId: string, voucher: any): void {
  try {
    const key = `maslahat_redeemed_vouchers_${userId}`;
    const existing: any[] = JSON.parse(localStorage.getItem(key) || '[]');
    // Hindari duplikasi berdasarkan kode voucher
    const isDuplicate = existing.some(v => v.voucher_code === voucher.voucher_code || v.code === voucher.code);
    if (!isDuplicate) {
      existing.unshift({ ...voucher, savedAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(existing));
    }
  } catch {
    // ignore storage errors
  }
}

// Baca voucher hasil tukar poin dari localStorage
function getRedeemedVouchersFromStorage(userId: string): any[] {
  try {
    const key = `maslahat_redeemed_vouchers_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export async function getUserVouchers(userId: string): Promise<any[]> {
  try {
    // Endpoint /api/users/:id/vouchers tidak tersedia di KASIR.
    // Ambil dari /api/promos yang berisi daftar promo kode diskon aktif.
    const response = await fetch(`${API_BASE_URL}/api/promos`, { headers: smartTagAuthHeaders() });
    const promoVouchers: any[] = [];
    if (response.ok) {
      const data = await response.json();
      const promos = Array.isArray(data) ? data : (data?.promos ?? data?.data ?? []);
      if (Array.isArray(promos)) {
        promos
          .filter((p: any) => p.status === 'Active' || p.status === 'active' || !p.status)
          .forEach((p: any) => {
            promoVouchers.push({
              id: `promo-${p.id}`,
              name: p.title || p.name || 'Voucher Diskon',
              title: p.title || p.name || 'Voucher Diskon',
              description: `Potongan ${p.type === 'Persen' ? p.discount + '%' : 'Rp ' + Number(p.discount || 0).toLocaleString('id-ID')}`,
              code: p.code || p.voucher_code || '',
              voucher_code: p.code || p.voucher_code || '',
              discount: p.type === 'Persen' ? `${p.discount}%` : `Rp ${Number(p.discount || 0).toLocaleString('id-ID')}`,
              discount_price: p.type !== 'Persen' ? Number(p.discount || 0) : 0,
              discount_percent: p.type === 'Persen' ? Number(p.discount || 0) : 0,
              minPurchase: Number(p.minPurchase || p.min_purchase || 0),
              expiry: p.period || '30 hari',
              color: 'from-orange-500 to-amber-600',
              icon: '🎫',
              cost: 0,
              used: false,
              source: 'promo',
              claimedAt: new Date().toLocaleString('id-ID'),
            });
          });
      }
    }

    // Gabungkan dengan voucher hasil tukar poin dari localStorage
    const redeemedVouchers = getRedeemedVouchersFromStorage(userId).map((v: any) => ({
      ...v,
      source: 'redeemed',
    }));

    // Redeemed vouchers muncul di awal
    return [...redeemedVouchers, ...promoVouchers];
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
    const cleanCode = voucherCode.trim().toUpperCase();

    // 1. Coba validasi langsung ke API backend jika endpoint tersedia
    try {
      const response = await fetch(`${API_BASE_URL}/api/promos/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...smartTagAuthHeaders() },
        body: JSON.stringify({
          user_id: userId,
          code: cleanCode,
          voucher_code: cleanCode,
          total_price: totalPrice,
          items,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'valid' || data.success === true || data.valid === true) {
          return {
            status: 'valid',
            message: data.message || 'Voucher valid.',
            discount_amount: data.discount_amount ?? data.discountAmount ?? 0,
            final_price: data.final_price ?? data.finalPrice ?? totalPrice,
            discount: data.discount || (data.discount_amount ? `Rp ${Number(data.discount_amount).toLocaleString('id-ID')}` : 'GRATIS'),
          };
        } else if (data.message || data.error) {
          return { status: 'error', message: data.message || data.error };
        }
      }
    } catch (err) {
      console.warn('Backend /api/promos/validate tidak merespons, menggunakan pemeriksaan katalog promo:', err);
    }

    // 2. Pemeriksaan dari voucher reward hasil tukar poin (localStorage)
    const redeemedVouchers = getRedeemedVouchersFromStorage(userId);
    const redeemedPromo = redeemedVouchers.find((item: any) => {
      const code = item.code ?? item.voucher_code;
      return String(code || '').toUpperCase() === cleanCode;
    });

    if (redeemedPromo) {
      if (redeemedPromo.used) {
        return { status: 'error', message: 'Voucher reward ini sudah digunakan.' };
      }
      return {
        status: 'valid',
        message: 'Voucher reward valid.',
        discount_amount: 0, // Reward item bukan diskon uang, tapi item gratis
        final_price: totalPrice,
        discount: redeemedPromo.title || 'Reward Gratis',
      };
    }

    // 3. Pemeriksaan dari katalog promo SmartTag
    const promos = await getSmartTagPromos();
    const promo = promos.find((item: any) => {
      const code = item.code ?? item.promo_code ?? item.voucher_code;
      return String(code || '').toUpperCase() === cleanCode;
    });
    if (!promo) return { status: 'error', message: 'Kode voucher tidak ditemukan di SmartTag.' };

    const status = String(promo.status || promo.state || 'Active').toLowerCase();
    if (status !== 'active' && status !== 'aktif' && status !== '1' && promo.status != null) {
      return { status: 'error', message: 'Voucher ini sudah tidak aktif.' };
    }

    // Pengecekan Kuota Pemakaian (Siapa cepat dia dapat)
    const maxUsage = Number(
      promo.max_usage ?? promo.maxUsage ?? promo.usage_limit ?? promo.limit ?? promo.kuota ?? promo.quota ?? promo.total_quota ?? Infinity
    );
    const usageCount = Number(
      promo.usage_count ?? promo.usageCount ?? promo.used_count ?? promo.usedCount ?? promo.times_used ?? promo.used ?? 0
    );

    if (maxUsage !== Infinity && usageCount >= maxUsage) {
      return { status: 'error', message: 'Maaf, kuota penggunaan voucher ini sudah habis.' };
    }

    const minimum = Number(promo.min_order ?? promo.min_purchase ?? promo.minPurchase ?? 0);
    if (totalPrice < minimum) {
      return { status: 'error', message: `Minimal transaksi voucher ini Rp ${minimum.toLocaleString('id-ID')}.` };
    }

    const rawDiscount = promo.discount_amount ?? promo.discount_value ?? promo.discount_price ?? promo.discount ?? 0;
    const discountType = String(promo.discount_type ?? promo.type ?? '').toUpperCase();
    const discountAmount = discountType.includes('PERCENT')
      ? Math.round((totalPrice * Number(rawDiscount)) / 100)
      : Number(rawDiscount);
    return {
      status: 'valid',
      message: 'Voucher valid dari SmartTag.',
      discount_amount: Math.min(totalPrice, discountAmount),
      final_price: Math.max(0, totalPrice - discountAmount),
      discount: discountType.includes('PERCENT') ? `${rawDiscount}%` : `Rp ${Number(rawDiscount).toLocaleString('id-ID')}`,
    };
  } catch (error) {
    console.error('validateVoucher failed:', error);
    return null;
  }
}

async function getSmartTagPromos(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/promos`, { headers: smartTagAuthHeaders() });
  if (!response.ok) return [];
  const payload = await response.json();
  const promos = Array.isArray(payload) ? payload : payload?.promos || payload?.data || [];
  return Array.isArray(promos) ? promos : [];
}

/**
 * Mendapatkan info kuota pemakaian sebuah kode voucher dari daftar promo SmartTag.
 * Returns null jika kode tidak ditemukan atau tidak ada limit.
 */
export async function getVoucherQuotaInfo(voucherCode: string): Promise<{
  maxUsage: number | null;
  usageCount: number;
  remaining: number | null;
  isExhausted: boolean;
} | null> {
  try {
    const promos = await getSmartTagPromos();
    const cleanCode = voucherCode.trim().toUpperCase();
    const promo = promos.find((item: any) => {
      const code = item.code ?? item.promo_code ?? item.voucher_code;
      return String(code || '').toUpperCase() === cleanCode;
    });
    if (!promo) return null;

    const rawMax = promo.max_usage ?? promo.maxUsage ?? promo.usage_limit ?? promo.limit ?? promo.kuota ?? promo.quota ?? promo.total_quota ?? null;
    const maxUsage = rawMax != null ? Number(rawMax) : null;
    const usageCount = Number(promo.usage_count ?? promo.usageCount ?? promo.used_count ?? promo.usedCount ?? promo.times_used ?? promo.used ?? 0);
    const remaining = maxUsage != null ? Math.max(0, maxUsage - usageCount) : null;
    const isExhausted = maxUsage != null && usageCount >= maxUsage;

    return { maxUsage, usageCount, remaining, isExhausted };
  } catch {
    return null;
  }
}

/**
 * Mendapatkan info kuota untuk semua voucher dalam satu daftar kode voucher.
 * Efisien karena hanya memanggil API sekali.
 */
export async function getBatchVoucherQuotaInfo(voucherCodes: string[]): Promise<Record<string, {
  maxUsage: number | null;
  usageCount: number;
  remaining: number | null;
  isExhausted: boolean;
}>> {
  try {
    const promos = await getSmartTagPromos();
    const result: Record<string, { maxUsage: number | null; usageCount: number; remaining: number | null; isExhausted: boolean }> = {};
    for (const voucherCode of voucherCodes) {
      const cleanCode = voucherCode.trim().toUpperCase();
      const promo = promos.find((item: any) => {
        const code = item.code ?? item.promo_code ?? item.voucher_code;
        return String(code || '').toUpperCase() === cleanCode;
      });
      if (!promo) continue;
      const rawMax = promo.max_usage ?? promo.maxUsage ?? promo.usage_limit ?? promo.limit ?? promo.kuota ?? promo.quota ?? promo.total_quota ?? null;
      const maxUsage = rawMax != null ? Number(rawMax) : null;
      const usageCount = Number(promo.usage_count ?? promo.usageCount ?? promo.used_count ?? promo.usedCount ?? promo.times_used ?? promo.used ?? 0);
      const remaining = maxUsage != null ? Math.max(0, maxUsage - usageCount) : null;
      const isExhausted = maxUsage != null && usageCount >= maxUsage;
      result[cleanCode] = { maxUsage, usageCount, remaining, isExhausted };
    }
    return result;
  } catch {
    return {};
  }
}
