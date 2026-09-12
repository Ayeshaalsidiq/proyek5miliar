import React from 'react';
import { X, User, Mail, Phone, Shield, Coins, ShoppingBag, LogOut, Ticket, ArrowLeft, IdCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    nim?: string;
    phone?: string;
    role?: string;
  } | null;
  points: number;
  onPointsClick: () => void;
  onHistoryClick: () => void;
  onLogout: () => void;
  onRedeemVoucherClick: () => void;
  isInline?: boolean;
}

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  points,
  onPointsClick,
  onHistoryClick,
  onLogout,
  onRedeemVoucherClick,
  isInline = false
}: ProfileModalProps) {
  if (!user && !isInline) return null;

  // Fallback guest details if user is null (for guest mode)
  const displayUser = user || {
    name: 'Tamu Restoran',
    email: 'mode.tamu@masyanto.com',
    role: 'Guest',
    phone: 'Belum Terhubung'
  };

  const cardContent = (
    <div className={`bg-white w-full max-w-2xl mx-auto rounded-[24px] overflow-hidden ${isInline ? 'pb-20' : 'shadow-2xl'} flex flex-col relative z-10`}>
      {/* Header removed as requested */}

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-6 bg-slate-50 space-y-4">
        {/* Profile Card */}
        <div className="bg-white border border-border-light rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center font-black text-3xl shadow-sm border border-primary/20 shrink-0 relative">
            {displayUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 w-full space-y-4">
            <div>
              <h4 className="font-black text-text-dark text-lg sm:text-xl leading-tight">{displayUser.name}</h4>
              <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                <Shield size={12} />
                {displayUser.role || 'Member'}
              </span>
            </div>

            <div className="pt-4 border-t border-border-light grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 text-text-light text-xs font-semibold bg-slate-50 p-2.5 rounded-xl border border-border-light">
                <Mail size={14} className="text-slate-400" />
                <span className="truncate">{displayUser.email}</span>
              </div>
              {displayUser.nim && (
                <div className="flex items-center gap-3 text-text-light text-xs font-semibold bg-slate-50 p-2.5 rounded-xl border border-border-light">
                  <IdCard size={14} className="text-slate-400" />
                  <span>{displayUser.nim}</span>
                </div>
              )}
              {displayUser.phone && (
                <div className="flex items-center gap-3 text-text-light text-xs font-semibold bg-slate-50 p-2.5 rounded-xl border border-border-light">
                  <Phone size={14} className="text-slate-400" />
                  <span>{displayUser.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Points Box */}
          <button
            onClick={() => {
              if (!isInline) onClose();
              onPointsClick();
            }}
            className="bg-white border border-border-light hover:border-orange-200 rounded-2xl p-4 flex items-center justify-between transition-all text-left active:scale-[0.98] cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 text-orange-500 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                <Coins size={18} />
              </div>
              <div>
                <h5 className="font-bold text-text-dark text-sm">Poin Loyalitas</h5>
                <p className="text-text-light text-[10px] font-semibold mt-0.5">Klaim hadiah spesial</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-primary text-base">{points.toLocaleString('id-ID')}</span>
              <span className="block text-[9px] font-black uppercase text-text-light tracking-wider">Poin</span>
            </div>
          </button>

          {/* Redeem Voucher Box */}
          <button
            onClick={() => {
              if (!isInline) onClose();
              onRedeemVoucherClick();
            }}
            className="bg-white border border-border-light hover:border-primary/30 rounded-2xl p-4 flex items-center justify-between transition-all text-left active:scale-[0.98] cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                <Ticket size={18} />
              </div>
              <div>
                <h5 className="font-bold text-text-dark text-sm">Klaim Voucher</h5>
                <p className="text-text-light text-[10px] font-semibold mt-0.5">Masukkan kode unik</p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
               <ArrowLeft size={12} className="rotate-180" />
            </div>
          </button>
        </div>

        {/* List Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => {
              if (!isInline) onClose();
              onHistoryClick();
            }}
            className="w-full bg-white hover:bg-slate-50 border border-border-light text-text-dark p-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-between cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingBag size={18} />
              </div>
              <span>Riwayat Pesanan</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
               <ArrowLeft size={12} className="rotate-180" />
            </div>
          </button>

          <button
            onClick={() => {
              if (!isInline) onClose();
              onLogout();
            }}
            className="w-full bg-white hover:bg-rose-50 border border-border-light hover:border-rose-200 text-rose-600 p-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-between cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <LogOut size={18} />
              </div>
              <span>Keluar Akun</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  if (isInline) {
    return cardContent;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-md flex flex-col"
          >
            {cardContent}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
