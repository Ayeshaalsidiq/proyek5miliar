import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ticket, Clock, QrCode, ChevronRight, Info, Coins } from 'lucide-react';
import { getCoinPromosCatalog, getRewardRedeemStatus, markRewardRedeemed, redeemCoinVoucher } from '../services/smartTagApi';
import type { PromoKoin } from '../types';
import VoucherTicketCard from './VoucherTicketCard';

interface VoucherRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
    points: number;
    onRefreshPoints: () => void;
  myVouchers: any[];
  onRefreshVouchers: () => void;
  onVoucherRedeemed: (voucher: any, promo: PromoKoin) => void;
  isInline?: boolean;
}

export default function VoucherRedeemModal({ 
  isOpen, 
  onClose, 
  userId,
    points,
    onRefreshPoints,
  myVouchers, 
  onRefreshVouchers,
  onVoucherRedeemed,
  isInline = false
}: VoucherRedeemModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'my_vouchers' | 'promo_code'>('my_vouchers');
  
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const [pointPromos, setPointPromos] = useState<PromoKoin[]>([]);
  const [loadingPointPromos, setLoadingPointPromos] = useState(false);
  const [redeemingPromo, setRedeemingPromo] = useState<string | null>(null);
  const [redeemMessage, setRedeemMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [redeemedPromos, setRedeemedPromos] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (!isOpen && !isInline) return;
    setLoadingPointPromos(true);
    getCoinPromosCatalog().then(async promos => {
      setPointPromos(promos);
      const statuses = await Promise.all(promos.map(async promo => [promo.id, await getRewardRedeemStatus(promo.id)] as const));
      setRedeemedPromos(new Set(statuses.filter(([, redeemed]) => redeemed).map(([id]) => id)));
    }).finally(() => setLoadingPointPromos(false));
  }, [isOpen, isInline]);

  const handleRedeemPoints = async (promo: PromoKoin) => {
    if (!userId) return setErrorMessage('Silakan login terlebih dahulu.');
    if (points < promo.coin_cost) return;
    setRedeemingPromo(promo.id);
    setRedeemMessage(null);
    const result = await redeemCoinVoucher(userId, promo.id);
    setRedeemingPromo(null);
    if (result?.status === 'success') {
      markRewardRedeemed(promo.id);
      setRedeemedPromos(previous => new Set(previous).add(promo.id));
      setRedeemMessage({ type: 'success', text: result.message || `${promo.title} berhasil ditukar.` });
      onVoucherRedeemed(result.data || {}, promo);
      onRefreshPoints();
      onRefreshVouchers();
    } else {
      setRedeemMessage({ type: 'error', text: result?.message || 'Voucher gagal ditukar oleh SmartTag.' });
    }
  };

  if (!isOpen && !isInline) return null;

  return (
    <AnimatePresence>
      <div className={isInline ? 'relative z-10 w-full mt-4 mb-8' : 'fixed inset-0 z-[70] flex items-end sm:items-center justify-center'}>
        {!isInline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
        )}

        <motion.div
          initial={{ y: isInline ? 0 : '100%', opacity: isInline ? 1 : 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: isInline ? 0 : '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className={`bg-white w-full max-w-md mx-auto flex flex-col ${isInline ? 'rounded-[24px] shadow-sm border border-border-light h-[calc(100vh-170px)] overflow-hidden' : 'sm:rounded-[24px] rounded-t-[24px] shadow-2xl relative z-10 max-h-[92vh] sm:max-h-[88vh] overflow-hidden'}`}
        >
          {/* Header */}
          {!isInline && (
            <div className="p-5 sm:p-6 border-b border-border-light flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                  <Ticket size={20} />
                </div>
                <div>
                  <h3 className="font-black text-text-dark text-lg sm:text-xl tracking-tight">Voucher Anda</h3>
                  <p className="text-text-light text-xs font-semibold mt-0.5">Klaim dan gunakan promo</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-text-light hover:text-text-dark active:scale-90 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Sub-tab Navigation */}
          <div className="px-6 pt-4 bg-white border-b border-border-light shrink-0">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveSubTab('my_vouchers')}
                className={`pb-3 font-bold text-[13px] border-b-[3px] transition-colors ${
                  activeSubTab === 'my_vouchers' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-dark'
                }`}
              >
                Voucher Saya
              </button>
              <button
                onClick={() => setActiveSubTab('promo_code')}
                className={`pb-3 font-bold text-[13px] border-b-[3px] transition-colors ${
                  activeSubTab === 'promo_code' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-dark'
                }`}
              >
                Tukar Voucher
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-32 bg-slate-50 relative min-h-0">
            <AnimatePresence mode="wait">
              {/* TAB 1: VOUCHER SAYA */}
              {activeSubTab === 'my_vouchers' && (
                <motion.div
                  key="tab-my-vouchers"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-4"
                >
                  {myVouchers.filter(v => !v.used).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white border border-border-light rounded-2xl shadow-sm">
                      <div className="bg-primary/10 p-5 rounded-full text-primary mb-4">
                        <Ticket size={32} />
                      </div>
                      <h4 className="font-bold text-text-dark text-sm">Dompet Kosong</h4>
                      <p className="text-text-light text-[11px] font-medium mt-1.5 max-w-xs leading-relaxed">
                        Anda belum memiliki voucher aktif saat ini.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        {myVouchers.filter(v => !v.used).map((v) => (
                          <VoucherTicketCard
                            key={v.id}
                            title={v.name || v.title}
                            code={v.voucher_code}
                            actionLabel="Gunakan"
                            onClick={() => setSelectedVoucher(v)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 2: TUKAR VOUCHER */}
              {activeSubTab === 'promo_code' && (
                <motion.div
                  key="tab-promo-code"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-4"
                >
                    <div className="space-y-4">
                      <div className="bg-white border border-border-light rounded-2xl shadow-sm overflow-hidden">
                        <div className="bg-orange-50 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="bg-white text-primary p-2 rounded-xl">
                              <Coins size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wider text-orange-500">Total Poin Anda</p>
                              <p className="text-xl font-black text-primary leading-tight">{points.toLocaleString('id-ID')} Poin</p>
                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Coins size={16} className="text-primary" />
                          <h4 className="font-black text-text-dark text-sm">Tukar Voucher dengan Poin</h4>
                        </div>
                        {redeemMessage && (
                          <div className={`rounded-xl px-3 py-2 text-xs font-bold ${redeemMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                            {redeemMessage.text}
                          </div>
                        )}
                        {loadingPointPromos ? (
                          <div className="bg-white rounded-2xl p-4 text-text-light text-xs">Memuat voucher SmartTag...</div>
                        ) : pointPromos.length === 0 ? (
                          <div className="bg-white border border-border-light rounded-2xl p-4 text-text-light text-xs">Belum ada voucher poin dari SmartTag.</div>
                        ) : pointPromos.map((promo) => (
                          <VoucherTicketCard
                            key={promo.id}
                            title={promo.title}
                            points={promo.coin_cost}
                            actionLabel={redeemingPromo === promo.id ? 'Memproses...' : redeemedPromos.has(promo.id) ? 'Sudah Ditukar' : promo.coin_cost <= 0 ? 'Tidak tersedia' : points >= promo.coin_cost ? 'Tukar Poin' : 'Poin Kurang'}
                            disabled={redeemedPromos.has(promo.id) || promo.coin_cost <= 0 || points < promo.coin_cost || redeemingPromo === promo.id}
                            isRedeemed={redeemedPromos.has(promo.id)}
                            onAction={() => handleRedeemPoints(promo)}
                          />
                        ))}
                      </div>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Barcode Modal (Voucher Detail) */}
        <AnimatePresence>
          {selectedVoucher && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedVoucher(null)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-[320px] rounded-[24px] overflow-hidden shadow-2xl relative z-10"
              >
                {/* Header Ticket Hole Graphic */}
                <div className="bg-primary/10 px-6 pt-8 pb-10 text-center relative border-b border-dashed border-primary/20">
                  <button
                    onClick={() => setSelectedVoucher(null)}
                    className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-text-light hover:text-text-dark active:scale-90 transition-all shadow-sm"
                  >
                    <X size={16} />
                  </button>
                  
                  {/* Fake Ticket Cutouts */}
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-white rounded-full" />
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full" />
                  
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-primary shadow-sm border border-border-light/50">
                    {selectedVoucher.icon ? <span className="text-3xl">{selectedVoucher.icon}</span> : <Ticket size={32} />}
                  </div>
                  <h3 className="text-text-dark font-black text-base sm:text-lg leading-tight">{selectedVoucher.name || selectedVoucher.title}</h3>
                </div>
                
                <div className="px-6 pt-8 pb-6 text-center bg-white relative">
                  <div className="bg-slate-50 border border-border-light rounded-xl p-4 mb-4 relative overflow-hidden">
                    <p className="text-[10px] text-text-light font-bold uppercase tracking-widest mb-1.5">Kode Promo</p>
                    <p className="text-xl sm:text-2xl font-black text-text-dark tracking-wider font-mono select-all">
                      {selectedVoucher.voucher_code}
                    </p>
                  </div>
                  
                  <p className="text-[11px] text-text-light font-medium mb-6 leading-relaxed">
                    {selectedVoucher.description}
                  </p>
                  
                  <button
                    onClick={() => setSelectedVoucher(null)}
                    className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all shadow-sm"
                  >
                    Tutup
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
