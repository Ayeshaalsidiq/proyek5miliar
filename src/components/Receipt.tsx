import React, { useState } from 'react';
import { CheckCircle2, Share2, Download, Printer, MessageSquare, Star, Clock, ChefHat, Check, FileText, User, CreditCard, Send } from 'lucide-react';
import { Order } from '../types';
import { motion } from 'motion/react';
import { submitOrderToBackend } from '../services/orderService';
import jsPDF from 'jspdf';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

interface ReceiptProps {
  order: Order;
  onClose: () => void;
  onUpdateOrder?: (updatedOrder: Order) => void;
}

export default function Receipt({ order, onClose, onUpdateOrder }: ReceiptProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittedRating, setSubmittedRating] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;

    setIsGeneratingPdf(true);
    try {
      const lineHeight = 5;
      const subtotal = order.subtotal ?? order.items.reduce((sum, item) => sum + ((item.discountPrice || item.price) * item.quantity), 0);
      const discount = order.discountAmount ?? Math.max(0, subtotal - order.total);
      const hasDiscount = discount > 0;
      const extraHeight = hasDiscount ? 12 : 0;
      const pageHeight = 58 + order.items.length * 10 + 28 + extraHeight;
      const pdf = new jsPDF({ unit: 'mm', format: [80, pageHeight] });
      const left = 7;
      let y = 10;
      const money = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 80, 20, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text('NGOLAB', 40, y, { align: 'center' });
      pdf.setFontSize(9);
      pdf.text('STRUK PESANAN', 40, y + 6, { align: 'center' });

      y = 28;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      pdf.text(`Order ID: ${order.id}`, left, y);
      pdf.text(order.timestamp, 73, y, { align: 'right' });
      y += 6;
      pdf.text(`Pemesan: ${order.customerName || 'Pelanggan'}`, left, y);
      pdf.text(`Meja: ${order.tableNumber}`, 73, y, { align: 'right' });
      y += 6;
      pdf.text(`Pembayaran: ${order.paymentMethod}`, left, y);
      y += 4;
      pdf.setDrawColor(160, 160, 160);
      pdf.line(left, y, 73, y);
      y += 6;

      pdf.setFont('helvetica', 'bold');
      pdf.text('RINCIAN PESANAN', left, y);
      y += 6;
      pdf.setFont('helvetica', 'normal');
      order.items.forEach((item) => {
        pdf.text(`${item.quantity}x ${item.name}`.substring(0, 32), left, y);
        pdf.text(money((item.discountPrice || item.price) * item.quantity), 73, y, { align: 'right' });
        y += lineHeight;
      });

      y += 2;
      pdf.line(left, y, 73, y);
      y += 6;

      if (hasDiscount) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text('Subtotal', left, y);
        pdf.text(money(subtotal), 73, y, { align: 'right' });
        y += lineHeight;

        pdf.text('Potongan Diskon', left, y);
        pdf.text(`-${money(discount)}`, 73, y, { align: 'right' });
        y += lineHeight;

        pdf.line(left, y, 73, y);
        y += 5;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('TOTAL BAYAR', left, y);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.text(money(order.total), 73, y, { align: 'right' });
      pdf.setTextColor(35, 43, 58);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Terima kasih telah memesan di NGOLAB', 40, y + 10, { align: 'center' });
      pdf.save(`struk-${order.id}.pdf`);
    } catch (error) {
      console.error('Gagal membuat PDF struk:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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
        <div className="bg-white flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="bg-[#FF6B00] px-8 py-4 text-center text-white relative">
            <h2 className="inline-block font-display font-black text-2xl mb-1 pb-1 border-b-2 border-white/80 tracking-tight drop-shadow-sm">PESANAN SELESAI</h2>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-6 pt-6 space-y-6 no-scrollbar bg-slate-50/50">
            {/* Transaction ID */}
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

              {/* Rincian Pesanan */}
              <div className="border-t border-slate-100 pt-5 space-y-5">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Rincian Pesanan</p>
                <div className="space-y-5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-1">
                        <p className="font-bold text-slate-800 text-sm leading-snug flex items-center gap-2">
                          <span>{item.name}</span>
                          <span className="text-[10px] font-black text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded-md shrink-0">x{item.quantity}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {item.note && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                              <MessageSquare size={10} className="text-slate-400" />
                              <span className="italic">"{item.note}"</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="font-black text-slate-800 text-sm whitespace-nowrap mt-0.5">
                        Rp {((item.discountPrice || item.price) * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>

                {(order.discountAmount ?? 0) > 0 && (
                  <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between text-red-500 text-sm font-bold">
                    <span>Potongan</span>
                    <span>-Rp {(order.discountAmount || 0).toLocaleString('id-ID')}</span>
                  </div>
                )}

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
            </div>

            {/* Rating Section */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <p className="text-center font-black text-slate-800 text-[11px] uppercase tracking-widest">Bagaimana layanan kami?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    disabled={submittedRating}
                    onClick={() => setRating(star)}
                    className={`p-1 flex items-center justify-center transition-all ${
                      rating >= star ? 'text-amber-400' : 'text-slate-300'
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
                  className="flex items-center gap-2"
                >
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="tulis ulasan anda"
                    disabled={submittedRating}
                    className="min-w-0 flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-50 disabled:bg-slate-50 disabled:text-slate-400 resize-none h-10 transition-all bg-white"
                  />
                  
                  {!submittedRating && (
                    <button
                      onClick={handleSubmitReview}
                      title="Kirim ulasan"
                      aria-label="Kirim ulasan"
                      className="p-2 shrink-0 text-[#FF6B00] hover:text-[#e66000] active:scale-95 transition-all flex items-center justify-center"
                    >
                      <Send size={22} />
                    </button>
                  )}
                </motion.div>
              )}

              {submittedRating && (
                <p className="text-center text-[11px] text-emerald-500 font-bold uppercase tracking-widest">
                  Terima kasih atas ulasan!
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex gap-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            title="Unduh struk PDF"
            className="p-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
          >
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
