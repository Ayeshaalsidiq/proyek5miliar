import React, { useState, useRef } from 'react';
import { X, QrCode, Wallet, CreditCard, CheckCircle2, ChevronRight, Copy, Landmark, Banknote, Upload, Image as ImageIcon, Trash2, Ticket } from 'lucide-react';
import { PaymentMethod, MyVoucher } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { validateVoucher } from '../services/tangolabService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (method: PaymentMethod, customerName: string) => void;
  myVouchers: MyVoucher[];
  appliedVoucher: MyVoucher | null;
  setAppliedVoucher: React.Dispatch<React.SetStateAction<MyVoucher | null>>;
  userId?: string;
  cartItems?: any[];
}

const METHOD_DETAILS: Record<string, { label: string; icon: any; color: string; detail: string; subDetail: string }> = {
  'QRIS':    { label: 'QRIS / Semua Bank',  icon: QrCode,    color: 'text-indigo-600', detail: 'Scan QR Code',    subDetail: 'OVO, Dana, GoPay, LinkAja, BCA Mobile' },
  'GoPay':   { label: 'GoPay',              icon: Wallet,    color: 'text-emerald-500',detail: '0812-3456-7890', subDetail: 'A/N Ngolab' },
  'OVO':     { label: 'OVO',                icon: CreditCard,color: 'text-purple-600', detail: '0812-3456-7890', subDetail: 'A/N Ngolab' },
  'Dana':    { label: 'Dana',               icon: Wallet,    color: 'text-blue-500',   detail: '0812-3456-7890', subDetail: 'A/N Ngolab' },
  'BCA':     { label: 'Transfer BCA',       icon: Landmark,  color: 'text-blue-700',   detail: '1234567890',     subDetail: 'A/N Ngolab' },
  'Mandiri': { label: 'Transfer Mandiri',   icon: Landmark,  color: 'text-amber-500',  detail: '0987654321',     subDetail: 'A/N Ngolab' },
  'Tunai':   { label: 'Tunai / Cash',       icon: Banknote,  color: 'text-green-600',  detail: 'Bayar di Kasir', subDetail: 'Tunjukkan ID Pesanan' },
};

export default function PaymentModal({
  isOpen,
  onClose,
  total,
  onConfirm,
  myVouchers,
  appliedVoucher,
  setAppliedVoucher,
  userId,
  cartItems,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('QRIS');
  const [customerName, setCustomerName]     = useState<string>('');
  const [isProcessing, setIsProcessing]     = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [paymentProof, setPaymentProof]     = useState<string | null>(null);
  const fileInputRef                        = useRef<HTMLInputElement>(null);
  const [showVoucherSheet, setShowVoucherSheet] = useState(false);
  const [voucherValidating, setVoucherValidating] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // ── Hitung diskon voucher ──────────────────────────────────────────────────
  let discountAmount = 0;
  if (appliedVoucher && appliedVoucher.discount !== 'GRATIS') {
    if (appliedVoucher.discount.includes('%')) {
      const pct = parseInt(appliedVoucher.discount.replace(/[^0-9]/g, ''), 10) || 0;
      discountAmount = Math.round((total * pct) / 100);
    } else {
      discountAmount = parseInt(appliedVoucher.discount.replace(/[^0-9]/g, ''), 10) || 0;
    }
  }
  const finalTotal = Math.max(0, total - discountAmount);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File terlalu besar! Maksimal 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setPaymentProof(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeProof = () => {
    setPaymentProof(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = () => {
    if (!customerName.trim()) { alert('Mohon masukkan nama pemesan terlebih dahulu'); return; }
    if (selectedMethod !== 'Tunai' && !paymentProof) { alert('Mohon upload bukti bayar terlebih dahulu'); return; }
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm(selectedMethod, customerName.trim());
      setIsProcessing(false);
    }, 2000);
  };

  const handleApplyVoucher = async (v: MyVoucher) => {
    const vCode = (v as any).voucher_code || v.code;
    if (userId && vCode) {
      setVoucherValidating(true);
      setVoucherError(null);
      const res = await validateVoucher(userId, vCode, total, cartItems || []);
      setVoucherValidating(false);
      if (res && res.status === 'valid') {
        setAppliedVoucher(v);
        setShowVoucherSheet(false);
      } else {
        setVoucherError(res?.message || 'Voucher tidak valid untuk pesanan ini.');
      }
    } else {
      // Fallback: apply without backend validation
      setAppliedVoucher(v);
      setShowVoucherSheet(false);
    }
  };

  const methods   = Object.keys(METHOD_DETAILS) as PaymentMethod[];
  const isDisabled = !customerName.trim() || (selectedMethod !== 'Tunai' && !paymentProof);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isProcessing ? onClose : undefined}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            className="bg-white w-full sm:max-w-[480px] rounded-t-[36px] sm:rounded-[36px] overflow-hidden relative z-10 shadow-2xl flex flex-col"
            style={{ maxHeight: '92vh' }}
          >
            {!isProcessing ? (
              <>
                {/* ── Sticky Header ─────────────────────────────────────── */}
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF6B00]">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h2 className="font-black text-lg text-slate-800 leading-none">Konfirmasi Pesanan</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pilih metode & kirim pesanan</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* ── Scrollable Body ───────────────────────────────────── */}
                <div className="overflow-y-auto flex-1" style={{ overscrollBehavior: 'contain' }}>
                  {/* Total Card */}
                  <div className="px-6 pt-6 pb-3">
                    <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C38] rounded-[32px] p-6 relative overflow-hidden shadow-lg shadow-orange-100">
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Pembayaran</p>
                        {appliedVoucher && discountAmount > 0 ? (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white/60 line-through font-medium text-sm">Rp {total.toLocaleString('id-ID')}</p>
                              <span className="bg-white text-[#FF6B00] px-2 py-0.5 rounded-md text-[10px] font-black">-{appliedVoucher.discount}</span>
                            </div>
                            <p className="text-3xl font-black text-white tracking-tight">Rp {finalTotal.toLocaleString('id-ID')}</p>
                          </>
                        ) : (
                          <p className="text-3xl font-black text-white tracking-tight">Rp {finalTotal.toLocaleString('id-ID')}</p>
                        )}
                      </div>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"
                      />
                    </div>
                  </div>

                  {/* ── Voucher Section ───────────────────────────────────── */}
                  <div className="px-6 pb-3">
                    {!appliedVoucher ? (
                      <button
                        onClick={() => setShowVoucherSheet(true)}
                        className="w-full bg-slate-50 border border-dashed border-slate-200 rounded-[28px] p-4 flex items-center justify-between group hover:bg-orange-50/50 hover:border-orange-200 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 text-[#FF6B00] rounded-2xl flex items-center justify-center">
                            <Ticket size={20} />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-slate-800 text-sm">Gunakan Voucher</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Makin hemat pakai voucher!</p>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-[#FF6B00] transition-colors" />
                      </button>
                    ) : (
                      <div className="w-full bg-orange-50 border border-orange-200 rounded-[28px] p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#FF6B00] text-white rounded-2xl flex items-center justify-center">
                            <CheckCircle2 size={20} />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-[#FF6B00] text-sm leading-tight">{appliedVoucher.title}</p>
                            <p className="text-[10px] font-bold text-orange-500 mt-0.5">Voucher berhasil dipasang ✓</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setAppliedVoucher(null)}
                          className="text-xs font-black text-slate-400 hover:text-red-500 underline transition-colors px-2 py-1"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ── Nama Pemesan ──────────────────────────────────────── */}
                  <div className="px-6 pb-4">
                    <div className="bg-slate-50 p-4 rounded-[28px] border border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1 mb-2">
                        Nama Pemesan <span className="text-[#FF6B00]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Budi"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 font-bold text-sm focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 transition-all focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* ── Metode Pembayaran ─────────────────────────────────── */}
                  <div className="px-6 pb-4 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Metode Tersedia</p>
                    {methods.map((method) => {
                      const info       = METHOD_DETAILS[method];
                      const isSelected = selectedMethod === method;
                      return (
                        <div key={method} className="space-y-2">
                          <button
                            onClick={() => setSelectedMethod(method)}
                            className={`w-full flex items-center justify-between p-4 rounded-[24px] border-2 transition-all duration-200 ${
                              isSelected
                                ? 'border-[#FF6B00] bg-orange-50/50'
                                : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl bg-white shadow-sm ${info.color}`}>
                                <info.icon size={20} />
                              </div>
                              <div className="text-left">
                                <p className="font-black text-slate-800 text-sm">{info.label}</p>
                                {!isSelected && (
                                  <p className="text-[10px] text-slate-400 font-bold">{info.subDetail}</p>
                                )}
                              </div>
                            </div>
                            {isSelected ? (
                              <div className="bg-[#FF6B00] rounded-full p-1">
                                <CheckCircle2 className="text-white" size={14} />
                              </div>
                            ) : (
                              <ChevronRight size={16} className="text-slate-300" />
                            )}
                          </button>

                          {/* Detail metode yang dipilih */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="bg-white border-2 border-orange-100 rounded-[24px] p-4 flex items-center justify-between mx-1">
                                  <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                      {method === 'QRIS' ? 'Instruksi' : 'Nomor Reff'}
                                    </p>
                                    <p className="font-black text-slate-700 text-base">{info.detail}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{info.subDetail}</p>
                                  </div>
                                  {method !== 'QRIS' && method !== 'Tunai' && (
                                    <button
                                      onClick={() => copyToClipboard(info.detail)}
                                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                        copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                      }`}
                                    >
                                      {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                      {copied ? 'Copied' : 'Salin'}
                                    </button>
                                  )}
                                  {method === 'QRIS' && (
                                    <div className="p-1.5 bg-slate-50 rounded-lg">
                                      <QrCode size={32} className="text-slate-400" />
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Upload Bukti Transfer ────────────────────────────── */}
                  {selectedMethod !== 'Tunai' && (
                    <div className="px-6 pb-4 space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">
                        Upload Bukti Transfer <span className="text-red-500">*</span>
                      </p>
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 flex items-start gap-3">
                        <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5">
                          <span className="text-[10px] font-black">!</span>
                        </div>
                        <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                          Bukti transfer akan diverifikasi oleh kasir. Pesanan baru diproses setelah pembayaran terkonfirmasi.
                        </p>
                      </div>
                      {!paymentProof ? (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-slate-200 bg-slate-50 rounded-[32px] p-8 flex flex-col items-center justify-center gap-3 group hover:border-orange-200 hover:bg-orange-50/30 transition-all"
                        >
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-[#FF6B00] shadow-sm transition-colors">
                            <Upload size={28} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-black text-slate-700">Upload Bukti Transfer</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Format: JPG, PNG • Max 5MB</p>
                          </div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </button>
                      ) : (
                        <div className="relative rounded-[32px] overflow-hidden border-2 border-orange-100 group">
                          <img src={paymentProof} alt="Bukti Bayar" className="w-full h-48 object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-700 hover:text-[#FF6B00] transition-colors shadow-xl"
                            >
                              <ImageIcon size={20} />
                            </button>
                            <button
                              onClick={removeProof}
                              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-xl"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Info Tunai ────────────────────────────────────────── */}
                  {selectedMethod === 'Tunai' && (
                    <div className="px-6 pb-6">
                      <div className="bg-amber-50 border border-amber-100 rounded-[28px] p-5 flex items-start gap-4">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                          <Banknote size={20} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-amber-800">Bayar di Kasir</p>
                          <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                            Pesanan akan dikirim ke dapur setelah Anda menyelesaikan pembayaran langsung di kasir. Tunjukkan ID pesanan kepada petugas kasir.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Sticky Footer ─────────────────────────────────────── */}
                <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                  <button
                    disabled={isDisabled}
                    onClick={handlePay}
                    className={`w-full py-5 rounded-[28px] font-black text-lg shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${
                      isDisabled
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                        : 'bg-[#FF6B00] text-white shadow-orange-100 hover:bg-[#e66000]'
                    }`}
                  >
                    Kirim Pesanan
                    <ChevronRight size={20} />
                  </button>
                  <p className="text-center text-[10px] text-slate-400 font-bold mt-4 leading-relaxed">
                    {selectedMethod === 'Tunai'
                      ? 'Pembayaran dilakukan langsung di kasir'
                      : 'Pembayaran akan diverifikasi oleh kasir'}
                  </p>
                </div>
              </>
            ) : (
              /* ── Processing State ─────────────────────────────────────── */
              <div className="py-24 flex flex-col items-center justify-center p-12">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="w-32 h-32 border-4 border-slate-100 border-t-[#FF6B00] rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <QrCode size={40} className="text-[#FF6B00] animate-pulse" />
                  </div>
                </div>
                <div className="text-center mt-10 space-y-2">
                  <h3 className="text-2xl font-black text-slate-800">Mengirim Pesanan</h3>
                  <p className="text-slate-400 font-bold text-sm">Pesananmu sedang dikirim ke kasir untuk diverifikasi...</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* ── Voucher Bottom Sheet ───────────────────────────────────── */}
          <AnimatePresence>
            {showVoucherSheet && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowVoucherSheet(false)}
                  className="absolute inset-0 z-20"
                />
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[36px] z-30 shadow-[0_-10px_60px_rgba(0,0,0,0.15)] flex flex-col"
                  style={{ maxHeight: '70vh' }}
                >
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
                    <h3 className="font-black text-lg text-slate-800">Pilih Voucher</h3>
                    <button
                      onClick={() => setShowVoucherSheet(false)}
                      className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="overflow-y-auto p-6 space-y-3">
                    {voucherValidating && (
                      <div className="flex items-center justify-center py-4 gap-3">
                        <div className="w-5 h-5 border-2 border-orange-200 border-t-[#FF6B00] rounded-full animate-spin" />
                        <span className="text-sm font-bold text-slate-500">Memvalidasi voucher...</span>
                      </div>
                    )}
                    {voucherError && (
                      <div className="bg-red-50 border border-red-100 p-3 rounded-2xl text-center">
                        <p className="text-red-600 text-xs font-bold">{voucherError}</p>
                      </div>
                    )}
                    {myVouchers.filter(v => !v.used).length === 0 ? (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                          <Ticket size={24} />
                        </div>
                        <p className="text-slate-400 font-bold text-sm">Tidak ada voucher tersedia.</p>
                        <p className="text-slate-400 text-xs mt-1">Klaim voucher dulu di menu Rewards ya!</p>
                      </div>
                    ) : (
                      myVouchers.filter(v => !v.used).map((v, i) => (
                        <button
                          key={`${v.id}-${i}`}
                          onClick={() => handleApplyVoucher(v)}
                          disabled={voucherValidating}
                          className={`w-full text-left border border-slate-100 rounded-[24px] overflow-hidden hover:border-orange-200 transition-colors ${voucherValidating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className={`bg-gradient-to-r ${v.color || 'from-[#FF6B00] to-yellow-500'} px-4 py-3 flex items-center gap-3`}>
                            <span className="text-2xl">{v.icon || '🎫'}</span>
                            <div className="flex-1">
                              <p className="text-white font-black text-sm">{(v as any).name || v.title}</p>
                              <p className="text-white/80 text-[10px] font-bold">{v.description}</p>
                            </div>
                            <div className="bg-white text-slate-800 px-3 py-1 rounded-xl font-black text-xs">
                              Pakai
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
