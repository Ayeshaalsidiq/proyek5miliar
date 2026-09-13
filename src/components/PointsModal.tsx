import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coins, Clock, Gift, Ticket, AlertCircle, RefreshCw } from 'lucide-react';
import { PromoKoin, MyVoucher, UserVoucher } from '../types';
import { getTransactionHistory, CoinTransaction, saveLocalTransaction } from '../services/tangolabService';
import { getCoinPromosCatalog, getRewardRedeemStatus, markRewardRedeemed, redeemCoinVoucher } from '../services/smartTagApi';
import VoucherTicketCard from './VoucherTicketCard';

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
  const [redeemedPromos, setRedeemedPromos] = useState<Set<string>>(new Set());

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
      const statuses = await Promise.all((data || []).map(async promo => [promo.id, await getRewardRedeemStatus(promo.id)] as const));
      setRedeemedPromos(new Set(statuses.filter(([, redeemed]) => redeemed).map(([id]) => id)));
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
      markRewardRedeemed(promo.id);
      setRedeemedPromos(previous => new Set(previous).add(promo.id));
      setRedeemSuccess(promo.title);
      // Track real redemption!
      saveLocalTransaction(userId, promo.coin_cost, 'redeem', `Tukar Voucher: ${promo.title}`);
      
      onRefreshPoints();
      setTimeout(() => setRedeemSuccess(null), 3000);
    } else {
      alert(res?.message || "Gagal menukar voucher. Silakan coba lagi.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
                <div className="w-10 h-10 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center">
                  <Coins size={18} className="text-[#FF6B00]" strokeWidth={2.5} />
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
              <div className="bg-orange-50 border border-orange-100 rounded-[28px] px-6 py-5 flex items-center justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-orange-500/80 text-[10px] font-black uppercase tracking-[0.2em] leading-none">Saldo Poin</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-black text-[#FF6B00]">{points.toLocaleString('id-ID')}</p>
                    <Coins size={18} className="text-[#FF6B00] mb-1" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="relative z-10 text-right">
                  <button onClick={onRefreshPoints} className="text-orange-500 bg-white border border-orange-100 p-2 rounded-xl flex items-center gap-1 active:scale-95 transition-all text-[10px] font-bold shadow-sm">
                    <RefreshCw size={12} /> Sync
                  </button>
                </div>
                <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/40 rounded-full" />
                <div className="absolute -right-2 -bottom-8 w-20 h-20 bg-white/40 rounded-full" />
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pb-3">
              <div className="bg-slate-50 border border-slate-100 p-1 rounded-2xl flex gap-1">
                <button
                  onClick={() => setActiveTab('KATALOG')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'KATALOG' ? 'bg-white text-slate-800 shadow-sm border border-slate-100' : 'text-slate-400'
                  }`}
                >
                  <Gift size={14} /> Katalog Promo
                </button>
                <button
                  onClick={() => setActiveTab('RIWAYAT')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'RIWAYAT' ? 'bg-white text-slate-800 shadow-sm border border-slate-100' : 'text-slate-400'
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
                            <div className="bg-slate-50 h-20"></div>
                            <div className="bg-white px-5 py-3 flex justify-between">
                              <div className="bg-slate-100 h-6 w-20 rounded-xl"></div>
                              <div className="bg-slate-100 h-8 w-24 rounded-xl"></div>
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
                        const isRedeemed = redeemedPromos.has(v.id);
                        
                        return (
                          <motion.div
                            key={v.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <VoucherTicketCard
                              title={v.title}
                              points={v.coin_cost}
                              actionLabel={isProcessing ? 'Memproses...' : isRedeemed ? 'Sudah Ditukar' : canAfford ? 'Tukar Poin' : 'Poin Kurang'}
                              disabled={isRedeemed || !canAfford || isProcessing}
                              isRedeemed={isRedeemed}
                              onAction={() => handleRedeem(v)}
                            />
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
                          <div key={i} className="bg-slate-50 border border-slate-100 h-16 rounded-2xl animate-pulse"></div>
                        ))}
                      </div>
                    ) : history.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="bg-slate-50 p-4 rounded-full text-slate-300 border border-slate-100 mb-3">
                          <Clock size={24} />
                        </div>
                        <h4 className="font-extrabold text-slate-700 text-sm">Belum Ada Riwayat</h4>
                        <p className="text-slate-400 text-[10px] font-semibold mt-1.5 max-w-xs leading-relaxed">
                          Anda belum memiliki riwayat transaksi koin.
                        </p>
                      </div>
                    ) : (
                      history.map((tx, i) => {
                        const normalizedType = String(tx.type).toLowerCase();
                        const isEarn = normalizedType === 'earn' || normalizedType === 'credit' || normalizedType === 'add';
                        return (
                          <motion.div
                            key={tx.id || i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all"
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isEarn ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                              {isEarn ? <Coins size={18} strokeWidth={2.5} /> : <Gift size={18} />}
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
      )}
    </AnimatePresence>
  );
}
