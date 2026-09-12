import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Copy, FileText, ChefHat, Coffee, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import { Order } from '../types';

interface OrderDetailScreenProps {
  order: Order;
  onBack: () => void;
  onReorder?: (order: Order) => void;
}

export default function OrderDetailScreen({ order, onBack, onReorder }: OrderDetailScreenProps) {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Menunggu';
      case 'DIPROSES': return 'Sedang Diproses';
      case 'SELESAI': return 'Selesai';
      case 'DIBATALKAN': return 'Dibatalkan';
      default: return status;
    }
  };

  const statusText = getStatusText(order.status);
  
  // Calculate subtotal
  const subtotal = order.subtotal ?? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = order.discountAmount ?? Math.max(0, subtotal - order.total);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getProgressStep = () => {
    if (order.status === 'DIBATALKAN') return 0;
    if (order.status === 'PENDING') return 1;
    if (order.status === 'DIPROSES') return 2;
    if (order.status === 'SELESAI') return 3;
    return 1;
  };

  const currentStep = getProgressStep();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 bg-[#F5F5F5] z-50 flex flex-col h-[100dvh]"
    >
      {/* App Bar */}
      <div className="bg-white px-4 py-3 sm:py-4 flex items-center shadow-sm shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors">
          <ArrowLeft size={24} className="text-text-dark" />
        </button>
        <h1 className="text-lg font-bold text-text-dark ml-2">Detail Pesanan</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Status Header Section */}
        <div className="bg-white p-5 pb-6 mb-2 shadow-sm rounded-b-2xl">
          <div className="flex justify-between items-start mb-8">
            <div className="max-w-[70%]">
              <h2 className="text-[22px] font-extrabold text-text-dark mb-1.5">{statusText}</h2>
              <p className="text-[13px] text-text-light leading-snug">
                {order.status === 'SELESAI' || order.status === 'Selesai'
                  ? 'Mau coba menu lainnya? Pesan lagi di NGOLAB Cafe!' 
                  : order.status === 'DIPROSES' || order.status === 'Diproses'
                  ? 'Pesanan Anda sedang disiapkan oleh tim kami.'
                  : 'Pesanan Anda telah diterima dan menunggu konfirmasi.'}
              </p>
            </div>
            {/* Status Illustration */}
            <div className="shrink-0 flex items-center justify-center pl-4">
              {order.status === 'SELESAI' || order.status === 'Selesai' ? (
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-emerald-500" strokeWidth={2.5} />
                </div>
              ) : order.status === 'DIPROSES' || order.status === 'Diproses' ? (
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                  <ChefHat size={40} className="text-primary" strokeWidth={2.5} />
                </div>
              ) : (
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                  <FileText size={40} className="text-blue-500" strokeWidth={2.5} />
                </div>
              )}
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="relative mt-8 mb-4 px-4">
            {/* Lines Container (stops exactly at center of first and last icon) */}
            <div className="absolute left-9 right-9 top-1/2 -translate-y-1/2 h-1 z-0">
              {/* Background Line */}
              <div className="absolute inset-0 bg-slate-200 rounded-full" />
              {/* Active Progress Line */}
              <div className={`absolute left-0 top-0 bottom-0 rounded-full transition-all duration-700 ease-out ${order.status === 'DIBATALKAN' ? 'bg-rose-500' : 'bg-primary'}`} style={{ width: currentStep <= 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }} />
            </div>

            <div className="relative flex justify-between items-center z-10">
              {/* Step 1: Diterima */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[2.5px] transition-colors duration-500 ${
                  currentStep === 1 ? 'border-blue-500 bg-blue-50 text-blue-600' : 
                  currentStep > 1 ? 'border-primary bg-orange-50 text-primary' : 
                  'border-slate-200 bg-white text-slate-300'
                }`}>
                  <FileText size={18} className={currentStep === 1 ? "fill-blue-200" : currentStep > 1 ? "fill-orange-200" : ""} />
                </div>
              </div>
              
              {/* Step 2: Diproses */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[2.5px] transition-colors duration-500 delay-150 ${
                  currentStep === 2 ? 'border-primary bg-orange-50 text-primary' : 
                  currentStep > 2 ? 'border-primary bg-orange-50 text-primary' : 
                  'border-slate-200 bg-white text-slate-300'
                }`}>
                  <ChefHat size={18} className={currentStep >= 2 ? "fill-orange-200" : ""} />
                </div>
              </div>

              {/* Step 3: Selesai */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[2.5px] transition-colors duration-500 delay-300 ${
                  currentStep === 3 ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 
                  'border-slate-200 bg-white text-slate-300'
                }`}>
                  <CheckCircle2 size={18} className={currentStep === 3 ? "fill-emerald-200" : ""} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details List */}
        <div className="bg-white p-5 mb-2 shadow-sm rounded-2xl">
          <h3 className="font-bold text-text-dark text-base mb-4">Rincian Pesanan</h3>
          
          <div className="space-y-4 mb-5">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-border-light shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-bold text-text-dark text-[13px] leading-tight">
                      <span className="font-normal text-text-dark mr-1">{item.quantity} x</span>
                      {item.name}
                    </p>
                    <p className="font-bold text-text-dark text-[13px] shrink-0">
                      Rp{(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </div>
                  {item.note && (
                    <p className="text-[11px] text-text-light mt-1 truncate">
                      {item.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-border-light pt-4 space-y-2.5 text-[13px]">
            <div className="flex justify-between font-bold text-text-dark">
              <span>Subtotal Pesanan ({order.items.reduce((acc, i) => acc + i.quantity, 0)} menu)</span>
              <span>Rp{subtotal.toLocaleString('id-ID')}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-text-light">
                <span>Potongan</span>
                <span className="text-red-500">-Rp{discountAmount.toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>

          <div className="border-t border-border-light mt-4 pt-4 flex justify-between items-end relative overflow-hidden">
            <div className="flex items-center">
              {/* Optional Paid Stamp watermark effect */}
              {(order.status === 'SELESAI' || order.status === 'Selesai') ? (
                <div className="border border-emerald-500/20 text-emerald-500/30 font-black text-xs uppercase px-2 py-0.5 rounded -rotate-12 select-none absolute left-0 bottom-1">
                  PAID
                </div>
              ) : null}
            </div>
            <div className="text-right w-full">
              <p className="font-black text-text-dark text-[22px] leading-none">
                Rp{order.total.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-white p-5 mb-6 shadow-sm">
          <h3 className="font-bold text-text-dark text-base mb-4">Informasi Pesanan</h3>
          
          <div className="space-y-3.5 text-[13px]">
            <div className="flex justify-between gap-4">
              <span className="text-text-light shrink-0">Catatan Tambahan</span>
              <span className="text-text-dark text-right truncate">Tidak ada</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-text-light shrink-0">No. Pesanan</span>
              <div className="flex items-center gap-2">
                <span className="text-text-dark font-mono text-xs">{order.id}</span>
                <button 
                  onClick={() => copyToClipboard(order.id)}
                  className="text-[#EE4D2D] font-bold text-[11px] uppercase tracking-wider hover:bg-orange-50 px-1 rounded transition-colors"
                >
                  Salin
                </button>
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-text-light shrink-0">Waktu Pemesanan</span>
              <span className="text-text-dark text-right">{order.timestamp}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-text-light shrink-0">Waktu Pembayaran</span>
              <span className="text-text-dark text-right">{order.timestamp}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-text-light shrink-0">Pembayaran</span>
              <span className="text-text-dark text-right font-medium">{order.paymentMethod}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      {(order.status === 'SELESAI' || order.status === 'Selesai') && onReorder && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border-light shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10 max-w-[480px] mx-auto">
          <button 
            onClick={() => onReorder(order)}
            className="w-full py-3.5 bg-[#EE4D2D] hover:bg-[#D73211] text-white rounded-lg font-bold text-sm transition-colors active:scale-[0.98]"
          >
            Pesan lagi
          </button>
        </div>
      )}
    </motion.div>
  );
}
