import React, { useState } from 'react';
import { CheckCircle2, Share2, Download, Printer, MessageSquare, Star } from 'lucide-react';
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
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="bg-[#FF6B00] p-10 text-center text-white relative">
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow-xl">
            <CheckCircle2 className="text-green-500" size={56} />
          </div>
          <h2 className="font-display font-bold text-3xl mb-1 tracking-tight">STATUS PESANAN</h2>
          <p className="text-orange-50 text-sm font-medium opacity-90 tracking-wide uppercase">Cek progres hidanganmu</p>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-14 space-y-8 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
          {/* Order Status Timeline */}
          <div className="w-full flex items-center justify-between px-4 pb-4">
            {[
              { label: 'Pending', icon: '🕒', current: (order.status as string) === 'PENDING' || (order.status as string) === 'Menunggu' },
              { label: 'Diproses', icon: '👨‍🍳', current: (order.status as string) === 'DIPROSES' || (order.status as string) === 'Sedang Disiapkan' },
              { label: 'Selesai', icon: '✅', current: (order.status as string) === 'SELESAI' || (order.status as string) === 'Selesai' }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${step.current ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-100' : 'bg-slate-100 text-slate-400'}`}>
                  {step.icon}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-tight ${step.current ? 'text-[#FF6B00]' : 'text-slate-300'}`}>{step.label}</span>
              </div>
            ))}
          </div>

          <div className="text-center space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Transaction ID</p>
            <p className="font-mono font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg inline-block">{order.id}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-6 border-y border-dashed border-slate-200 text-left">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Pemesan / Meja</p>
              <p className="font-bold text-slate-800 text-base">{order.customerName || `Meja ${order.tableNumber}`}</p>
              <p className="text-[10px] text-slate-500 font-medium">Meja: {order.tableNumber}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Pembayaran</p>
              <p className="font-bold text-slate-800 text-base">{order.paymentMethod}</p>
              <p className="text-[10px] text-green-600 font-bold">LUNAS</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Detail Pesanan</p>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm bg-white pr-2">
                      {item.name} <span className="text-[#FF6B00]">x{item.quantity}</span>
                    </p>
                    {item.note && (
                      <div className="flex items-start gap-1 text-[9px] text-slate-500 bg-orange-50 px-2 py-1 rounded-lg mt-1 w-fit">
                        <MessageSquare size={10} className="text-[#FF6B00] mt-0.5" />
                        <span className="italic">"{item.note}"</span>
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-slate-800 text-sm">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center px-1">
            <div className="space-y-1">
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Total Bayar</p>
              <div className="flex items-center gap-2">
                <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black w-fit uppercase tracking-tighter">
                  LUNAS
                </div>
                {order.pointsEarned && order.pointsEarned > 0 && (
                  <div className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black w-fit uppercase tracking-tighter flex items-center gap-1">
                    <Star size={10} fill="currentColor" strokeWidth={0} />
                    +{order.pointsEarned} POIN
                  </div>
                )}
              </div>
            </div>
            <p className="text-3xl font-bold text-[#FF6B00]">
              Rp {order.total.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Rating & Review Section for Admin Sync */}
          <div className="pt-8 border-t border-slate-100 space-y-4">
            <p className="text-center font-bold text-slate-600 text-sm">Bagaimana layanan kami?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  disabled={submittedRating}
                  onClick={() => setRating(star)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    rating >= star ? 'bg-yellow-400 text-white' : 'bg-slate-100 text-slate-300'
                  } active:scale-95`}
                >
                  <motion.span animate={rating >= star ? { scale: [1, 1.2, 1] } : {}}>★</motion.span>
                </button>
              ))}
            </div>

            {rating > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tulis ulasan Anda tentang makanan dan pelayanan kami..."
                  disabled={submittedRating}
                  className="w-full p-3 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B00] disabled:bg-slate-50 disabled:text-slate-400 resize-none h-20 transition-all"
                />
                
                {!submittedRating && (
                  <button
                    onClick={handleSubmitReview}
                    className="w-full bg-[#FF6B00] hover:bg-[#e66000] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Kirim Ulasan
                  </button>
                )}
              </motion.div>
            )}

            {submittedRating && (
              <p className="text-center text-[10px] text-green-500 font-bold uppercase tracking-widest mt-2 animate-bounce">
                Terima kasih atas ulasan!
              </p>
            )}
          </div>

          <div className="text-center pt-4">
            <p className="text-[10px] text-slate-300 font-medium">Jangan lupa scan struk ini jika diperlukan!</p>
          </div>
        </div>

        <div className="p-8 bg-slate-50 flex gap-4 border-t border-slate-100">
          <button className="p-4 bg-white border-2 border-slate-100 text-slate-400 rounded-[24px] hover:bg-slate-100 transition-all active:scale-90">
            <Printer size={20} />
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-900 text-white py-4 rounded-[24px] font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            Tutup Struk
          </button>
        </div>
      </motion.div>
    </div>
  );
}
