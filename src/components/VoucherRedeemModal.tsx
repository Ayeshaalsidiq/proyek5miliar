import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ticket, Sparkles, AlertCircle, Clock, QrCode, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { claimPromoCode } from '../services/tangolabService';

interface VoucherRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  myVouchers: any[];
  onRefreshVouchers: () => void;
  isInline?: boolean;
}

export default function VoucherRedeemModal({ 
  isOpen, 
  onClose, 
  userId,
  myVouchers, 
  onRefreshVouchers,
  isInline = false
}: VoucherRedeemModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'my_vouchers' | 'promo_code'>('my_vouchers');
  
  // Redeem Code States
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setStatus('error');
      setErrorMessage('Silakan login terlebih dahulu.');
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setStatus('validating');
    setErrorMessage('');

    const res = await claimPromoCode(userId, cleanCode);
    if (res && res.status === 'success') {
      setStatus('success');
      onRefreshVouchers();
    } else {
      setStatus('error');
      setErrorMessage(res?.message || 'Kode voucher tidak valid atau sudah digunakan.');
    }
  };

  const resetState = () => {
    setCode('');
    setStatus('idle');
    setErrorMessage('');
  };

  if (!isOpen && !isInline) return null;

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-[70] flex items-end sm:items-center justify-center ${isInline ? 'relative z-10' : ''}`}>
        {!isInline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
        )}

        <motion.div
          initial={{ y: isInline ? 0 : '100%', opacity: isInline ? 1 : 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: isInline ? 0 : '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className={`bg-white w-full max-w-md mx-auto ${isInline ? 'rounded-[36px] shadow-sm border border-slate-100' : 'sm:rounded-[40px] rounded-t-[40px] shadow-2xl relative z-10'} flex flex-col max-h-[92vh] sm:max-h-[88vh]`}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-50 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-t-[40px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B00] to-amber-500 rounded-2xl flex items-center justify-center shadow-md shadow-orange-100">
                <Ticket size={18} className="text-white" />
              </div>
              <div className="text-left">
                <h2 className="font-black text-base text-slate-800 leading-none">Dompet Voucher</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Voucher Anda</p>
              </div>
            </div>
            {!isInline && (
              <button
                onClick={onClose}
                className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Sub-tab Navigation */}
          <div className="px-6 pt-4 pb-2 bg-slate-50">
            <div className="bg-slate-200/50 p-1.5 rounded-2xl flex gap-1">
              <button
                onClick={() => setActiveSubTab('my_vouchers')}
                className={`flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeSubTab === 'my_vouchers' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Ticket size={14} /> Voucher Saya
              </button>
              <button
                onClick={() => setActiveSubTab('promo_code')}
                className={`flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeSubTab === 'promo_code' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Sparkles size={14} /> Klaim Kode
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50 relative min-h-[350px]">
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
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-[28px] bg-white">
                      <div className="bg-orange-50 p-6 rounded-full text-[#FF6B00] mb-4">
                        <Ticket size={36} />
                      </div>
                      <h4 className="font-black text-slate-700 text-sm">Dompet Kosong</h4>
                      <p className="text-slate-400 text-[10px] font-semibold mt-2 max-w-xs leading-relaxed">
                        Anda belum memiliki voucher aktif.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pl-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Voucher Aktif ({myVouchers.filter(v => !v.used).length})
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {myVouchers.filter(v => !v.used).map((v) => (
                          <div 
                            key={v.id}
                            onClick={() => setSelectedVoucher(v)}
                            className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                          >
                            <div className={`w-24 shrink-0 flex flex-col items-center justify-center text-white p-2 text-center bg-gradient-to-br ${v.color || 'from-[#FF6B00] to-yellow-500'}`}>
                              <span className="text-xl mb-1">{v.icon || '🎫'}</span>
                              <span className="font-black text-[10px] tracking-widest uppercase">{v.discount_price ? `Rp${v.discount_price/1000}K` : 'Diskon'}</span>
                            </div>
                            <div className="flex-1 p-3">
                              <h4 className="font-black text-slate-800 text-sm truncate leading-tight">{v.name || v.title}</h4>
                              <p className="text-slate-500 text-[10px] font-semibold mt-0.5 line-clamp-2 leading-tight">{v.description}</p>
                              <div className="flex items-center gap-1 mt-2 text-slate-400">
                                <Clock size={10} />
                                <span className="text-[9px] font-bold">Kode: {v.voucher_code}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 2: KLAIM KODE */}
              {activeSubTab === 'promo_code' && (
                <motion.div
                  key="tab-promo-code"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-5"
                >
                  {status !== 'success' ? (
                    <div className="space-y-5">
                      <div className="bg-white border border-slate-200 rounded-[28px] p-5 flex gap-4 shadow-sm">
                        <div className="bg-[#FF6B00] text-white p-3 rounded-2xl h-fit shadow-md shadow-orange-100 flex items-center justify-center shrink-0">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">Punya Kode Spesial?</h4>
                          <p className="text-slate-500 text-[10px] font-semibold leading-relaxed mt-1">
                            Masukkan kode voucher untuk menambahkannya ke dompet.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleRedeem} className="space-y-4 bg-white p-5 rounded-[28px] border border-slate-200 shadow-sm">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                            Kode Voucher
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="KODE PROMO"
                              value={code}
                              onChange={(e) => setCode(e.target.value)}
                              disabled={status === 'validating'}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-800 uppercase tracking-widest text-sm outline-none focus:bg-white focus:border-[#FF6B00] transition-all disabled:opacity-60"
                            />
                            {status === 'validating' && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                                <div className="w-5 h-5 border-2 border-orange-200 border-t-[#FF6B00] rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        </div>

                        {status === 'error' && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-100 p-3.5 rounded-2xl flex items-start gap-3 text-red-700"
                          >
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <p className="text-[11px] font-bold leading-relaxed">{errorMessage}</p>
                          </motion.div>
                        )}

                        <button
                          type="submit"
                          disabled={!code.trim() || status === 'validating'}
                          className="w-full bg-[#FF6B00] hover:bg-[#e66000] text-white py-3.5 rounded-2xl font-black text-sm uppercase shadow-lg shadow-orange-100 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          {status === 'validating' ? 'Memvalidasi...' : 'Klaim Kode'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <motion.div
                      key="redeem-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center py-6 text-center space-y-5 bg-white border border-slate-200 rounded-[36px] p-6 shadow-sm"
                    >
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner">
                        <CheckCircle2 size={36} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-slate-800 leading-tight">Berhasil!</h3>
                        <p className="text-slate-500 text-[11px] font-semibold leading-relaxed max-w-[200px] mx-auto">
                          Kode berhasil ditukarkan dan ditambahkan ke dompet voucher Anda.
                        </p>
                      </div>
                      <div className="flex w-full gap-2 pt-2">
                        <button
                          onClick={() => {
                            resetState();
                            setActiveSubTab('my_vouchers');
                          }}
                          className="flex-1 bg-[#FF6B00] text-white py-3 rounded-2xl font-black text-xs uppercase shadow-md active:scale-95 transition-all"
                        >
                          Lihat Dompet
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Barcode Modal */}
        <AnimatePresence>
          {selectedVoucher && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedVoucher(null)}
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
              />
              <motion.div
                initial={{ y: 60, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 60, opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-sm rounded-[36px] overflow-hidden shadow-2xl relative z-10"
              >
                <div className={`bg-gradient-to-r ${selectedVoucher.color || 'from-[#FF6B00] to-yellow-500'} px-6 pt-8 pb-10 text-center relative`}>
                  <button
                    onClick={() => setSelectedVoucher(null)}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
                  >
                    <X size={16} />
                  </button>
                  <p className="text-4xl mb-2">{selectedVoucher.icon || '🎫'}</p>
                  <h3 className="text-white font-black text-lg leading-tight">{selectedVoucher.name || selectedVoucher.title}</h3>
                </div>
                <div className="px-6 pt-6 pb-8 space-y-5 text-center">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Kode Voucher</p>
                    <p className="text-2xl font-black text-slate-800 tracking-wider font-mono">{selectedVoucher.voucher_code}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">{selectedVoucher.description}</p>
                  <button
                    onClick={() => setSelectedVoucher(null)}
                    className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-black text-sm active:scale-95 transition-all"
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
