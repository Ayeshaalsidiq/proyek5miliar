import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Clock, Gift, Ticket, AlertCircle, RefreshCw } from 'lucide-react';
import { PromoKoin, MyVoucher, UserVoucher } from '../types';
import { getCoinPromosCatalog, getTransactionHistory, redeemCoinVoucher, CoinTransaction } from '../services/tangolabService';

interface PointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
  userId?: string;
  onRefreshPoints: () => void;
  onClaim: (points: number, source?: string) => void;
}

export default function PointsModal({ isOpen, onClose, points, userId, onRefreshPoints, onClaim }: PointsModalProps) {
  const [activeTab, setActiveTab] = useState<'KATALOG' | 'RIWAYAT'>('KATALOG');
  const [promos, setPromos] = useState<PromoKoin[]>([]);
  const [history, setHistory] = useState<CoinTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    if (activeTab === 'KATALOG') {
      const data = await getCoinPromosCatalog();
      setPromos(data || []);
    } else if (activeTab === 'RIWAYAT' && userId) {
      const data = await getTransactionHistory(userId);
      setHistory(data || []);
    }
    setIsLoading(false);
  };

  const handleRedeem = async (promo: PromoKoin) => {
    if (!userId) {
      alert("Harap login terlebih dahulu untuk menukar poin.");
      return;
    }
    if (points < promo.coin_cost) return;

    setIsRedeeming(promo.id);
    const res = await redeemCoinVoucher(userId, promo.id);
    setIsRedeeming(null);

    if (res && res.status === 'success') {
      setRedeemSuccess(promo.title);
      onRefreshPoints();
      setTimeout(() => setRedeemSuccess(null), 3000);
    } else {
      alert(res?.message || "Gagal menukar voucher. Silakan coba lagi.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="bg-white w-full max-w-md sm:rounded-[40px] rounded-t-[40px] overflow-hidden relative z-10 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-md shadow-orange-200">
                <Star size={18} fill="white" strokeWidth={0} />
              </div>
              <div>
                <h2 className="font-black text-base text-slate-800 leading-none">Mas Yanto Rewards</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Katalog Promo Koin</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Points banner */}
          <div className="px-6 pb-4">
            <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-400 rounded-[28px] px-6 py-4 flex items-center justify-between shadow-lg shadow-orange-200/60 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] leading-none">Saldo Poin</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-black text-white">{points.toLocaleString('id-ID')}</p>
                  <Star size={18} fill="white" strokeWidth={0} className="mb-1" />
                </div>
              </div>
              <div className="relative z-10 text-right">
                <button onClick={onRefreshPoints} className="text-white/90 bg-white/20 p-2 rounded-xl backdrop-blur flex items-center gap-1 active:scale-95 transition-all text-[10px] font-bold">
                  <RefreshCw size={12} /> Sync
                </button>
              </div>
              <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full" />
              <div className="absolute -right-2 -bottom-8 w-20 h-20 bg-white/10 rounded-full" />
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pb-3">
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
              <button
                onClick={() => setActiveTab('KATALOG')}
                className={`flex-1 py-2.5 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'KATALOG' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
                }`}
              >
                <Gift size={14} /> Katalog Promo
              </button>
              <button
                onClick={() => setActiveTab('RIWAYAT')}
                className={`flex-1 py-2.5 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'RIWAYAT' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
                }`}
              >
                <Clock size={14} /> Riwayat Koin
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6 relative min-h-[300px]">
            <AnimatePresence mode="wait">
              {/* ─── Tab: KATALOG ─── */}
              {activeTab === 'KATALOG' && (
                <motion.div
                  key="katalog"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <AnimatePresence>
                    {redeemSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3"
                      >
                        <Gift size={18} className="text-emerald-500 shrink-0" />
                        <p className="text-emerald-700 text-xs font-black">
                          Promo "{redeemSuccess}" berhasil ditukar! Cek di menu Dompet Voucher.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="border border-slate-100 rounded-3xl overflow-hidden animate-pulse">
                          <div className="bg-slate-200 h-24"></div>
                          <div className="bg-white px-5 py-3 flex justify-between">
                            <div className="bg-slate-200 h-4 w-20 rounded"></div>
                            <div className="bg-slate-200 h-8 w-24 rounded-xl"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : promos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-[28px] bg-white">
                      <div className="bg-orange-50 p-4 rounded-full text-[#FF6B00] mb-3">
                        <Gift size={24} />
                      </div>
                      <h4 className="font-extrabold text-slate-700 text-sm">Belum Ada Promo</h4>
                      <p className="text-slate-400 text-[10px] font-semibold mt-1.5 max-w-xs leading-relaxed">
                        Katalog promo koin sedang kosong saat ini.
                      </p>
                    </div>
                  ) : (
                    promos.map((v, i) => {
                      const canAfford = points >= v.coin_cost;
                      const isProcessing = isRedeeming === v.id;
                      
                      let discountText = v.discount_type === 'PERCENTAGE' 
                        ? `${v.discount_value}%` 
                        : `Rp ${v.discount_value.toLocaleString('id-ID')}`;

                      return (
                        <motion.div
                          key={v.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`border rounded-3xl overflow-hidden transition-all shadow-sm ${canAfford ? 'border-slate-100' : 'border-slate-100 opacity-70 grayscale-[30%]'}`}
                        >
                          <div className="bg-gradient-to-r from-orange-400 to-red-500 px-5 py-4 flex items-center gap-3 relative overflow-hidden">
                            <div className="absolute right-0 top-0 bottom-0 opacity-10">
                              <Ticket size={100} className="-rotate-12 translate-x-4" />
                            </div>
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shadow-inner shrink-0 z-10">
                              <Ticket size={24} className="text-white" />
                            </div>
                            <div className="flex-1 z-10">
                              <p className="text-white font-black text-sm leading-tight drop-shadow-sm">{v.title}</p>
                              <p className="text-white/90 text-[10px] font-semibold mt-0.5 line-clamp-2">{v.description}</p>
                            </div>
                            <div className="bg-white/90 px-3 py-1.5 rounded-xl text-center shadow-sm z-10">
                              <p className="text-orange-600 font-black text-base leading-none whitespace-nowrap">{discountText}</p>
                            </div>
                          </div>
                          <div className="bg-white px-5 py-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
                              <Star size={14} fill="#FF6B00" className="text-orange-500" />
                              <p className="font-black text-orange-600 text-sm">{v.coin_cost}</p>
                            </div>
                            <button
                              disabled={!canAfford || isProcessing}
                              onClick={() => handleRedeem(v)}
                              className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 flex items-center gap-1 ${
                                canAfford
                                  ? 'bg-[#FF6B00] hover:bg-[#e66000] text-white shadow-md shadow-orange-200'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              {isProcessing ? 'Memproses...' : canAfford ? 'Tukar Poin' : 'Poin Kurang'}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              )}

              {/* ─── Tab: RIWAYAT ─── */}
              {activeTab === 'RIWAYAT' && (
                <motion.div
                  key="riwayat"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3"
                >
                  {!userId ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                      <p className="text-slate-500 font-bold text-sm">Silakan login untuk melihat riwayat.</p>
                    </div>
                  ) : isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-slate-100 h-16 rounded-2xl animate-pulse"></div>
                      ))}
                    </div>
                  ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <div className="bg-slate-100 p-4 rounded-full text-slate-300 mb-3">
                        <Clock size={24} />
                      </div>
                      <h4 className="font-extrabold text-slate-700 text-sm">Belum Ada Riwayat</h4>
                      <p className="text-slate-400 text-[10px] font-semibold mt-1.5 max-w-xs leading-relaxed">
                        Anda belum memiliki riwayat transaksi koin.
                      </p>
                    </div>
                  ) : (
                    history.map((tx, i) => {
                      const isEarn = tx.type === 'earn' || tx.type === 'EARN';
                      return (
                        <motion.div
                          key={tx.id || i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isEarn ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                            {isEarn ? <Star size={18} fill="currentColor" /> : <Gift size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-slate-800 text-sm truncate">{tx.description}</p>
                            <p className="text-[10px] font-bold text-slate-400">{tx.timestamp ? new Date(tx.timestamp).toLocaleString('id-ID') : '-'}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className={`font-black text-base ${isEarn ? 'text-emerald-500' : 'text-red-500'}`}>
                              {isEarn ? '+' : '-'}{tx.amount}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
