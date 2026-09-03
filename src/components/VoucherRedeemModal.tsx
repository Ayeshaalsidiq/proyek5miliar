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
      <div className={isInline ? 'relative z-10 w-full mb-8' : 'fixed inset-0 z-[70] flex items-end sm:items-center justify-center'}>
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
          <div className="p-5 sm:p-6 border-b border-border-light flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3 text-left">
              <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                <Ticket size={20} />
              </div>
              <div>
                <h3 className="font-black text-text-dark text-lg sm:text-xl tracking-tight">Voucher Anda</h3>
                <p className="text-text-light text-xs font-semibold mt-0.5">Klaim dan gunakan promo menarik</p>
              </div>
            </div>
            {!isInline && (
              <button
                onClick={onClose}
                className="w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-text-light hover:text-text-dark active:scale-90 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>

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
                Klaim Kode
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
                          <div 
                            key={v.id}
                            onClick={() => setSelectedVoucher(v)}
                            className="bg-white border border-border-light rounded-2xl flex overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
                          >
                            {/* Left Graphic */}
                            <div className="w-[90px] sm:w-[100px] bg-slate-50 flex flex-col items-center justify-center p-3 border-r border-dashed border-border-light shrink-0 relative overflow-hidden">
                              <div className="absolute top-0 bottom-0 -left-1 w-2 bg-primary" />
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-1.5 text-primary">
                                {v.icon ? <span>{v.icon}</span> : <Ticket size={20} />}
                              </div>
                              <span className="font-black text-primary text-[10px] sm:text-[11px] uppercase tracking-wider text-center line-clamp-1">{v.discount_price ? `Rp${v.discount_price/1000}K` : 'Promo'}</span>
                            </div>
                            
                            {/* Right Info */}
                            <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
                              <div>
                                <h4 className="font-bold text-text-dark text-[13px] sm:text-sm truncate leading-tight">{v.name || v.title}</h4>
                                <p className="text-text-light text-[10px] sm:text-[11px] font-medium mt-1 line-clamp-2 leading-snug">{v.description}</p>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-[9px] sm:text-[10px] font-bold text-text-light bg-slate-100 px-2 py-0.5 rounded uppercase border border-border-light">{v.voucher_code}</span>
                                <span className="text-[10px] sm:text-[11px] font-bold text-primary flex items-center gap-0.5">Gunakan <ChevronRight size={14} /></span>
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
                  className="space-y-4"
                >
                  {status !== 'success' ? (
                    <div className="space-y-4">
                      <div className="bg-white border border-border-light rounded-2xl p-4 sm:p-5 flex gap-4 shadow-sm items-center">
                        <div className="bg-primary/10 text-primary p-3 rounded-xl h-fit flex items-center justify-center shrink-0">
                          <Sparkles size={24} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-text-dark text-sm">Punya Kode Promo?</h4>
                          <p className="text-text-light text-[11px] font-medium mt-0.5 leading-snug">
                            Klaim kode unikmu untuk mendapatkan penawaran spesial.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleRedeem} className="bg-white p-4 sm:p-5 rounded-2xl border border-border-light shadow-sm">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-text-dark">
                            Masukkan Kode Voucher
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="KODE PROMO"
                              value={code}
                              onChange={(e) => setCode(e.target.value)}
                              disabled={status === 'validating'}
                              className="w-full bg-slate-50 border border-border-light rounded-xl px-4 py-3 font-black text-text-dark uppercase tracking-widest text-sm outline-none focus:bg-white focus:border-primary transition-all disabled:opacity-60"
                            />
                            {status === 'validating' && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                                <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        </div>

                        {status === 'error' && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-start gap-2.5 text-rose-600 mt-4"
                          >
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <p className="text-[11px] font-bold leading-snug">{errorMessage}</p>
                          </motion.div>
                        )}

                        <button
                          type="submit"
                          disabled={!code.trim() || status === 'validating'}
                          className="w-full mt-4 bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold text-sm shadow-sm disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          {status === 'validating' ? 'Memvalidasi...' : 'Klaim Kode Sekarang'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <motion.div
                      key="redeem-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center py-8 text-center space-y-4 bg-white border border-border-light rounded-2xl p-6 shadow-sm"
                    >
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                        <CheckCircle2 size={40} strokeWidth={2.5} />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-black text-text-dark">Klaim Berhasil!</h3>
                        <p className="text-text-light text-[11px] font-medium max-w-[220px] mx-auto leading-snug">
                          Voucher berhasil ditambahkan ke dompet Anda.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          resetState();
                          setActiveSubTab('my_vouchers');
                        }}
                        className="mt-2 w-full bg-slate-100 hover:bg-slate-200 text-text-dark py-3 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all"
                      >
                        Lihat Voucher Saya
                      </button>
                    </motion.div>
                  )}
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
