import React, { useState, useRef } from 'react';
import { X, QrCode, Wallet, CreditCard, CheckCircle2, ChevronRight, Copy, Landmark, Banknote, Upload, Image as ImageIcon, Trash2, Ticket, MessageSquare } from 'lucide-react';
import { PaymentMethod, MyVoucher } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { validateVoucher } from '../services/smartTagApi';
import VoucherTicketCard from './VoucherTicketCard';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (method: PaymentMethod, customerName: string, note: string, paymentProof: File | null) => void | Promise<void>;
  myVouchers: MyVoucher[];
  appliedVoucher: MyVoucher | null;
  setAppliedVoucher: React.Dispatch<React.SetStateAction<MyVoucher | null>>;
  userId?: string;
  cartItems?: any[];
  isInline?: boolean;
  orderType?: 'Dine In' | 'Takeaway' | 'Delivery FIT';
  setOrderType?: (type: 'Dine In' | 'Takeaway' | 'Delivery FIT') => void;
  deliveryAddress?: string;
  setDeliveryAddress?: (addr: string) => void;
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
  isInline = false,
  orderType,
  setOrderType,
  deliveryAddress,
  setDeliveryAddress,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('QRIS');
  const [isProcessing, setIsProcessing]     = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [paymentProof, setPaymentProof]     = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [paymentProofName, setPaymentProofName] = useState('');
  const fileInputRef                        = useRef<HTMLInputElement>(null);
  const [showVoucherSheet, setShowVoucherSheet] = useState(false);
  const [isVoucherExpanded, setIsVoucherExpanded] = useState(false);
  const [showAllMethods, setShowAllMethods] = useState(false);
  const [voucherValidating, setVoucherValidating] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [orderNote, setOrderNote] = useState('');


  // ── Hitung diskon voucher ──────────────────────────────────────────────────
  const isRewardVoucher = Boolean(appliedVoucher && (appliedVoucher as any).voucherType !== 'promo');
  const discountLabel = appliedVoucher?.discount || '';
  const discountAmount = appliedVoucher && !isRewardVoucher
    ? discountLabel.includes('%')
      ? Math.round(total * (parseInt(discountLabel.replace(/[^0-9]/g, ''), 10) || 0) / 100)
      : parseInt(discountLabel.replace(/[^0-9]/g, ''), 10) || 0
    : 0;
  const finalTotal = Math.max(0, total - discountAmount);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const compressImage = (file: File): Promise<Blob> => new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const maxDimension = 1280;
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');

      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Canvas tidak tersedia'));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl);
        if (blob) resolve(blob);
        else reject(new Error('Gagal mengompres gambar'));
      }, 'image/jpeg', 0.75);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal membaca gambar'));
    };
    image.src = objectUrl;
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('File harus berupa gambar.'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('File terlalu besar! Maksimal 10MB sebelum kompresi.'); return; }

    try {
      const compressedBlob = await compressImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProof(compressedBlob instanceof File ? compressedBlob : new File([compressedBlob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' }));
        setPaymentProofPreview(reader.result as string);
        setPaymentProofName(`${file.name.replace(/\.[^.]+$/, '')}.jpg`);
      };
      reader.readAsDataURL(compressedBlob);
    } catch {
      alert('Gagal memproses bukti pembayaran. Silakan pilih gambar lain.');
    }
  };

  const removeProof = () => {
    setPaymentProof(null);
    setPaymentProofPreview(null);
    setPaymentProofName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = () => {
    if (selectedMethod !== 'Tunai' && !paymentProof) { alert('Mohon upload bukti bayar terlebih dahulu'); return; }
    setIsProcessing(true);
    setTimeout(async () => {
      try {
        await onConfirm(selectedMethod, '', orderNote.trim(), paymentProof);
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  const handleApplyVoucher = async (v: MyVoucher) => {
    const vCode = (v as any).voucher_code || v.code;
    if ((v as any).promo_id) {
      setAppliedVoucher(v);
      setVoucherError(null);
      setShowVoucherSheet(false);
      return;
    }
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

  const handleApplyVoucherCode = async () => {
    const cleanCode = voucherCode.trim().toUpperCase();
    if (!cleanCode) return;
    if (!userId) {
      setVoucherError('Silakan login terlebih dahulu untuk menggunakan kode diskon.');
      return;
    }

    setVoucherValidating(true);
    setVoucherError(null);
    const res = await validateVoucher(userId, cleanCode, total, cartItems || []);
    setVoucherValidating(false);

    if (res?.status === 'valid') {
      const discount = res.discount || (res.discount_amount ? `Rp ${res.discount_amount.toLocaleString('id-ID')}` : 'GRATIS');
      setAppliedVoucher({
        id: `code-${cleanCode}`,
        title: `Kode ${cleanCode}`,
        description: 'Kode diskon berhasil diterapkan',
        cost: 0,
        discount,
        expiry: '',
        color: 'from-[#FF6B00] to-yellow-500',
        icon: '🎟️',
        claimedAt: new Date().toISOString(),
        code: cleanCode,
        used: false,
        voucherType: 'promo',
      });
      setVoucherCode('');
      setShowVoucherSheet(false);
    } else {
      setVoucherError(res?.message || 'Kode diskon tidak valid untuk pesanan ini.');
    }
  };



  const methods   = Object.keys(METHOD_DETAILS) as PaymentMethod[];
  const isDisabled = selectedMethod !== 'Tunai' && !paymentProof;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={isInline ? "w-full" : "fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6"}>
          {!isInline && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={!isProcessing ? onClose : undefined}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
          )}

          {/* Modal Card */}
          <motion.div
            initial={isInline ? { opacity: 0 } : { y: 60, opacity: 0, scale: 0.97 }}
            animate={isInline ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
            exit={isInline ? { opacity: 0 } : { y: 60, opacity: 0, scale: 0.97 }}
            className={`w-full flex flex-col relative z-10 ${isInline ? 'bg-transparent pb-4' : 'bg-white sm:max-w-[480px] rounded-t-[36px] sm:rounded-[36px] overflow-hidden shadow-2xl'}`}
            style={isInline ? {} : { maxHeight: '92vh' }}
          >
            {!isProcessing ? (
              <>
                {/* ── Sticky Header ─────────────────────────────────────── */}
                {!isInline && (
                  <div className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center text-[#FF6B00]">
                        <CreditCard size={16} />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-slate-800 leading-tight">Konfirmasi Pesanan</h2>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pilih metode &amp; kirim pesanan</p>
                      </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* ── Scrollable Body ───────────────────────────────────── */}
                <div className={`flex-1 ${!isInline ? 'overflow-y-auto' : 'px-2 sm:px-4 space-y-2'}`} style={!isInline ? { overscrollBehavior: 'contain' } : undefined}>
                  {/* ── Total Card + Voucher (digabung) ─────────────────── */}
                  <div className={isInline ? 'pb-2' : 'px-4 pb-2'}>

                    <div className="overflow-hidden rounded-[24px] border border-orange-200 shadow-sm">
                      <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C38] px-4 py-3.5 flex items-start justify-between gap-2">
                      <p className="shrink-0 pt-1 whitespace-nowrap text-white/70 text-[11px] sm:text-xs font-black uppercase tracking-[0.08em] sm:tracking-[0.15em]">Total Pembayaran</p>
                      {appliedVoucher && discountAmount > 0 ? (
                        <div className="flex flex-col items-end min-w-0">
                          <p className="text-white/60 line-through font-medium text-xs whitespace-nowrap">Rp {total.toLocaleString('id-ID')}</p>
                          <p className="text-white/80 text-xs font-bold whitespace-nowrap">-Rp {discountAmount.toLocaleString('id-ID')}</p>
                          <p className="mt-0.5 text-lg sm:text-xl font-black text-white tracking-tight whitespace-nowrap">Rp {finalTotal.toLocaleString('id-ID')}</p>
                        </div>
                      ) : (
                        <p className="text-lg sm:text-xl font-black text-white tracking-tight whitespace-nowrap">Rp {finalTotal.toLocaleString('id-ID')}</p>
                      )}
                      </div>

                      {/* Voucher — disambung di bawah kartu */}
                      {!appliedVoucher ? (
                        <button
                          onClick={() => setShowVoucherSheet(true)}
                          className="w-full bg-white px-3 py-2.5 flex items-center justify-between group hover:bg-orange-50/40 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-orange-100 text-[#FF6B00] rounded-md flex items-center justify-center">
                              <Ticket size={12} />
                            </div>
                            <p className="font-bold text-slate-500 text-xs">Gunakan Voucher</p>
                          </div>
                          <ChevronRight size={13} className="text-slate-300 group-hover:text-[#FF6B00] transition-colors" />
                        </button>
                      ) : (
                        <div className="w-full bg-orange-50 px-3 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 bg-[#FF6B00] text-white rounded-md flex items-center justify-center shrink-0">
                              <CheckCircle2 size={12} />
                            </div>
                            <p className="font-bold text-[#FF6B00] text-xs truncate">{appliedVoucher.title} ✓</p>
                          </div>
                          <button
                            onClick={() => setAppliedVoucher(null)}
                            className="text-[10px] font-black text-slate-400 hover:text-red-500 underline transition-colors shrink-0"
                          >
                            Hapus
                          </button>
                        </div>
                      )}

                      <div className="border-t border-slate-100 px-3 py-1">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={13} className="shrink-0 text-[#FF6B00]" />
                          <label className="shrink-0 text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Catatan
                          </label>
                          <input
                            value={orderNote}
                            onChange={(event) => setOrderNote(event.target.value)}
                            placeholder="Tambahkan catatan..."
                            maxLength={200}
                            className="min-w-0 flex-1 bg-transparent py-1.5 text-xs font-medium text-slate-700 outline-none placeholder:text-slate-400"
                          />
                          <span className="shrink-0 text-[9px] font-bold text-slate-400">{orderNote.length}/200</span>
                        </div>
                      </div>
                    </div>
                  </div>

                    {/* QR Code display if QRIS is selected */}
                    {selectedMethod === 'QRIS' && (
                      <div className={`${isInline ? '' : 'mx-4'} flex flex-col items-center p-4 bg-orange-50/50 rounded-[24px] border border-orange-100 shadow-sm`}>
                        <div className="bg-white p-4 rounded-[20px] shadow-sm mb-4">
                          <img src="/qris.png" alt="QRIS" className="w-56 h-56 object-contain rounded-xl" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 text-center px-6 leading-relaxed">
                          Scan QR Code ini menggunakan E-Wallet atau M-Banking Anda
                        </p>
                      </div>
                    )}
                    
                    {/* Bank Transfer Details if selected */}
                    {(selectedMethod === 'BCA' || selectedMethod === 'Mandiri' || selectedMethod === 'GoPay' || selectedMethod === 'OVO' || selectedMethod === 'Dana') && (
                      <div className="space-y-4 py-2 bg-orange-50/30 rounded-[24px] p-4 border border-orange-100">
                        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">No. Rekening / Virtual Account</p>
                            <p className="font-bold text-slate-800 tracking-wide text-lg">{METHOD_DETAILS[selectedMethod].detail}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(METHOD_DETAILS[selectedMethod].detail)}
                            className="p-3 bg-orange-50 text-[#FF6B00] rounded-xl hover:bg-orange-100 transition-colors active:scale-95"
                          >
                            {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                          </button>
                        </div>
                        <div className="text-xs font-medium text-slate-500 bg-white p-4 rounded-2xl leading-relaxed text-center shadow-sm">
                          Transfer tepat <span className="font-black text-[#FF6B00]">Rp {finalTotal.toLocaleString('id-ID')}</span> agar pesanan dapat diproses.
                        </div>
                      </div>
                    )}

                    {/* Cash Info */}
                    {selectedMethod === 'Tunai' && (
                      <div className="bg-amber-50 border border-amber-100 rounded-[24px] p-4 flex items-start gap-3">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm shrink-0 mt-0.5">
                          <Banknote size={16} />
                        </div>
                        <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                          Tunjukkan ID pesanan kepada kasir setelah mengirim pesanan ini. Pembayaran dilakukan di kasir.
                        </p>
                      </div>
                    )}

                  {/* ── Upload Bukti Transfer ────────────────────────────── */}
                  {selectedMethod !== 'Tunai' && (
                    <div className="px-4 pb-2 space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1">
                        Upload Bukti Transfer <span className="text-red-500">*</span>
                      </p>
                      <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-white shrink-0">
                          <span className="text-[9px] font-black">!</span>
                        </div>
                        <p className="text-[10px] text-amber-700 font-medium leading-snug">
                          Bukti diverifikasi kasir sebelum pesanan diproses.
                        </p>
                      </div>
                      {!paymentProof ? (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl p-2.5 flex items-center justify-center gap-2 group hover:border-orange-200 hover:bg-orange-50/30 transition-all"
                        >
                          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-300 group-hover:text-[#FF6B00] shadow-sm transition-colors">
                            <Upload size={16} />
                          </div>
                          <div className="text-center">
                            <p className="text-[11px] font-black text-slate-700">Pilih Bukti Transfer</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">JPG, PNG • Max 5MB</p>
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
                        <div className="relative rounded-xl overflow-hidden border border-orange-100 bg-orange-50/30 p-2 flex items-center gap-3 group">
                          <img src={paymentProofPreview || undefined} alt="Bukti Bayar" className="w-12 h-12 rounded-lg object-cover shrink-0 bg-white" />
                          <p className="min-w-0 flex-1 text-xs font-bold text-slate-700 truncate" title={paymentProofName}>
                            {paymentProofName || 'Bukti pembayaran'}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-500 hover:text-[#FF6B00] transition-colors shadow-sm"
                              aria-label="Ganti bukti pembayaran"
                            >
                              <ImageIcon size={16} />
                            </button>
                            <button
                              onClick={removeProof}
                              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                              aria-label="Hapus bukti pembayaran"
                            >
                              <Trash2 size={16} />
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
                </div>

                {/* ── Sticky Footer ─────────────────────────────────────── */}
                <div className={`px-4 py-3 border-t border-slate-100 shrink-0 ${isInline ? 'bg-transparent' : 'bg-white'}`}>
                  <button
                    disabled={isDisabled}
                    onClick={handlePay}
                    className={`w-full py-3 rounded-2xl font-black text-sm shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                      isDisabled
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                        : 'bg-[#FF6B00] text-white shadow-orange-100 hover:bg-[#e66000]'
                    }`}
                  >
                    Kirim Pesanan
                    <ChevronRight size={16} />
                  </button>
                  <p className="text-center text-[9px] text-slate-400 font-bold mt-1.5">
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
                  className="fixed inset-0 z-20"
                />
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                  className="fixed bottom-0 left-0 right-0 mx-auto max-w-[480px] bg-white rounded-t-[36px] z-30 shadow-[0_-10px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
                  style={{ height: isVoucherExpanded ? '92vh' : '70vh' }}
                >
                  <button
                    onClick={() => setIsVoucherExpanded((expanded) => !expanded)}
                    className="w-full pt-3 pb-1 flex justify-center shrink-0 cursor-pointer"
                    aria-label={isVoucherExpanded ? 'Perkecil popup voucher' : 'Perbesar popup voucher'}
                  >
                    <span className="w-12 h-1.5 rounded-full bg-slate-300" />
                  </button>
                  <div className="px-6 pt-2 pb-5 border-b border-slate-50 flex items-center justify-between shrink-0">
                    <h3 className="font-black text-lg text-slate-800">Pilih Voucher</h3>
                    <button
                      onClick={() => setShowVoucherSheet(false)}
                      className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div
                    className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y p-6 pb-24 space-y-3"
                    onWheel={(event) => event.stopPropagation()}
                    onTouchMove={(event) => event.stopPropagation()}
                    style={{
                      overscrollBehaviorY: 'contain',
                      WebkitOverflowScrolling: 'touch',
                      touchAction: 'pan-y',
                    }}
                  >
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 space-y-2.5">
                      <p className="text-xs font-black text-slate-700">Gunakan kode diskon</p>
                      <div className="flex gap-2">
                        <input
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleApplyVoucherCode(); }}
                          placeholder="MASUKKAN KODE"
                          disabled={voucherValidating}
                          className="min-w-0 flex-1 bg-white border border-orange-100 rounded-xl px-3 py-2.5 text-xs font-black tracking-wider outline-none focus:border-[#FF6B00] disabled:opacity-60"
                        />
                        <button
                          onClick={handleApplyVoucherCode}
                          disabled={!voucherCode.trim() || voucherValidating}
                          className="bg-[#FF6B00] text-white px-3 rounded-xl text-xs font-black disabled:opacity-50"
                        >
                          Pakai
                        </button>
                      </div>
                      <p className="text-[10px] font-medium text-orange-700">Masukkan kode promo yang Anda miliki.</p>
                    </div>
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
                    
                    {myVouchers && myVouchers.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs font-black text-slate-700 mb-3">Atau gunakan voucher Anda:</p>
                        <div className="space-y-3">
                          {myVouchers.map((voucher) => (
                            <VoucherTicketCard
                              key={voucher.id}
                              title={voucher.title}
                              discountText={voucher.discount}
                              actionLabel="Pakai"
                              onClick={() => {
                                setAppliedVoucher({
                                  ...voucher,
                                  used: false,
                                  voucherType: 'promo',
                                });
                                setShowVoucherSheet(false);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Payment Methods Bottom Sheet ───────────────────────────── */}
          <AnimatePresence>
            {showAllMethods && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAllMethods(false)}
                  className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                  className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[36px] z-50 shadow-[0_-10px_60px_rgba(0,0,0,0.15)] flex flex-col"
                  style={{ maxHeight: '80vh' }}
                >
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
                    <h3 className="font-black text-lg text-slate-800">Metode Pembayaran</h3>
                    <button
                      onClick={() => setShowAllMethods(false)}
                      className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="overflow-y-auto p-6 pb-24 space-y-6">
                    {[
                      { title: 'Pembayaran Instan', methods: ['QRIS'] },
                      { title: 'E-Wallet', methods: ['GoPay', 'OVO', 'Dana'] },
                      { title: 'Transfer Bank', methods: ['BCA', 'Mandiri'] },
                      { title: 'Bayar Langsung', methods: ['Tunai'] }
                    ].map(group => (
                      <div key={group.title} className="space-y-3">
                        <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-2">{group.title}</p>
                        {group.methods.map((methodStr) => {
                          const method = methodStr as PaymentMethod;
                          const info = METHOD_DETAILS[method];
                          const isSelected = selectedMethod === method;
                          return (
                            <button
                              key={method}
                              onClick={() => { setSelectedMethod(method); setShowAllMethods(false); }}
                              className={`w-full flex items-center justify-between p-4 rounded-[24px] border-2 transition-all duration-200 ${
                                isSelected
                                  ? 'border-[#FF6B00] bg-orange-50/50'
                                  : 'border-slate-100 bg-white hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl bg-slate-50 shadow-sm ${info.color}`}>
                                  {React.createElement(info.icon, { size: 20 })}
                                </div>
                                <div className="text-left">
                                  <p className="font-black text-slate-800 text-sm">{info.label}</p>
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#FF6B00]' : 'border-slate-300'}`}>
                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
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
