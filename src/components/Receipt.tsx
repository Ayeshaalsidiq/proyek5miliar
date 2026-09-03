import React, { useState } from 'react';
import { CheckCircle2, Share2, Download, Printer, MessageSquare, Star, Clock, ChefHat, Check, FileText, User, CreditCard } from 'lucide-react';
import { Order } from '../types';
import { motion } from 'motion/react';
import { submitOrderToBackend } from '../services/orderService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface ReceiptProps {
  order: Order;
  onClose: () => void;
  onUpdateOrder?: (updatedOrder: Order) => void;
}

export default function Receipt({ order, onClose, onUpdateOrder }: ReceiptProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittedRating, setSubmittedRating] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) return;
    setSubmittedRating(true);
    const updatedOrder: Order = {
      ...order,
      rating: rating,
      review: reviewText,
      status: 'SELESAI'
    };
    await submitOrderToBackend(updatedOrder);

    // Kirim rating untuk masing-masing menu item ke /api/ratings
    for (const item of order.items) {
      try {
        await fetch(`${API_BASE_URL}/api/ratings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerName: order.customerName || `Meja ${order.tableNumber}`,
            rating: rating,
            comment: reviewText,
            orderId: order.id,
            menuId: item.id
          })
        });
      } catch (err) {
        console.error(`Gagal mengirim ulasan untuk menu ${item.name}:`, err);
      }
    }

    if (onUpdateOrder) {
      onUpdateOrder(updatedOrder);
    }
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col max-h-[90vh]"
      >
        {/* Header - Back to Theme Orange */}
        <div className="bg-[#FF6B00] p-8 pb-12 text-center text-white relative">
          <h2 className="font-display font-black text-3xl mb-2 tracking-tight drop-shadow-sm">STATUS PESANAN</h2>
          <p className="text-orange-50 text-[11px] font-bold tracking-[0.2em] uppercase opacity-90">Cek progres hidanganmu</p>
          
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white p-2.5 rounded-full shadow-xl">
            <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="text-white" size={32} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-16 space-y-8 no-scrollbar bg-slate-50/50">
          {/* Order Status Timeline with better spacing */}
          <div className="w-full flex items-center justify-between px-4 pb-2 relative">
            <div className="absolute top-6 left-12 right-12 h-0.5 bg-slate-200 -z-0" />
            {[
              { label: 'Pending', icon: <Clock size={24} />, current: (order.status as string) === 'PENDING' || (order.status as string) === 'Menunggu' },
              { label: 'Diproses', icon: <ChefHat size={24} />, current: (order.status as string) === 'DIPROSES' || (order.status as string) === 'Sedang Disiapkan' },
              { label: 'Selesai', icon: <Check size={24} />, current: (order.status as string) === 'SELESAI' || (order.status as string) === 'Selesai' }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center gap-4 relative z-10 bg-transparent">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${step.current ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30 ring-4 ring-white' : 'bg-white text-slate-300 border border-slate-100 shadow-sm'}`}>
                  {step.icon}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step.current ? 'text-[#FF6B00]' : 'text-slate-400'}`}>{step.label}</span>
              </div>
            ))}
          </div>

          {/* Transaction ID with more breathing room */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Order ID</p>
              </div>
              <span className="font-mono font-black text-slate-800 text-sm tracking-wider">{order.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-dashed border-slate-100">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <User size={14} />
                  <p className="text-[9px] font-black uppercase tracking-widest">Pemesan / Meja</p>
                </div>
                <p className="font-black text-slate-800 text-sm truncate">{order.customerName || `Meja ${order.tableNumber}`}</p>
                <div className="inline-block px-2 py-1 bg-slate-50 rounded-md">
                  <p className="text-[10px] text-slate-500 font-bold">Meja: {order.tableNumber}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-right">
                <div className="flex items-center justify-end gap-1.5 text-slate-400">
                  <p className="text-[9px] font-black uppercase tracking-widest">Pembayaran</p>
                  <CreditCard size={14} />
                </div>
                <p className="font-black text-slate-800 text-sm truncate">{order.paymentMethod}</p>
                <div className="inline-block px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-md">
                  <p className="text-[10px] text-emerald-600 font-black tracking-widest">LUNAS</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rincian Pesanan Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Rincian Pesanan</p>
            <div className="space-y-5">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-slate-800 text-sm leading-snug">
                      {item.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded-md">x{item.quantity}</span>
                      {item.note && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                          <MessageSquare size={10} className="text-slate-400" />
                          <span className="italic">"{item.note}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="font-black text-slate-800 text-sm whitespace-nowrap mt-0.5">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-5 border-t border-slate-100 flex justify-between items-end">
              <div className="space-y-1.5">
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Total Bayar</p>
                {order.pointsEarned && order.pointsEarned > 0 ? (
                  <div className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border border-amber-100">
                    <Star size={10} fill="currentColor" strokeWidth={0} />
                    +{order.pointsEarned} POIN
                  </div>
                ) : null}
              </div>
              <p className="text-2xl font-black text-[#FF6B00] tracking-tight">
                Rp {order.total.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Rating Section - Keeping it elegant but matching spacing */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <p className="text-center font-black text-slate-800 text-[11px] uppercase tracking-widest">Bagaimana layanan kami?</p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  disabled={submittedRating}
                  onClick={() => setRating(star)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    rating >= star ? 'bg-amber-400 text-white shadow-lg shadow-amber-200' : 'bg-slate-50 text-slate-300 border border-slate-100'
                  } active:scale-90`}
                >
                  <motion.span animate={rating >= star ? { scale: [1, 1.2, 1] } : {}}>
                    <Star size={24} fill={rating >= star ? "currentColor" : "none"} strokeWidth={rating >= star ? 0 : 2} />
                  </motion.span>
                </button>
              ))}
            </div>

            {rating > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-2"
              >
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tulis ulasan Anda tentang makanan dan pelayanan kami..."
                  disabled={submittedRating}
                  className="w-full p-4 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-50 disabled:bg-slate-50 disabled:text-slate-400 resize-none h-24 transition-all bg-white"
                />
                
                {!submittedRating && (
                  <button
                    onClick={handleSubmitReview}
                    className="w-full bg-[#FF6B00] hover:bg-[#e66000] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Kirim Ulasan
                  </button>
                )}
              </motion.div>
            )}

            {submittedRating && (
              <p className="text-center text-[11px] text-emerald-500 font-bold uppercase tracking-widest animate-bounce">
                Terima kasih atas ulasan!
              </p>
            )}
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex gap-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10">
          <button className="p-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center">
            <Printer size={24} />
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#FF6B00] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#e66000] transition-all active:scale-95 shadow-xl shadow-orange-500/25"
          >
            Tutup Struk
          </button>
        </div>
      </motion.div>
    </div>
  );
}
