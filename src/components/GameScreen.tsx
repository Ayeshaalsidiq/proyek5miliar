import React from 'react';
import { motion } from 'motion/react';
import { X, Gamepad2, ArrowLeft } from 'lucide-react';

interface GameScreenProps {
  onClose: () => void;
  onGameComplete: (pointsEarned: number) => void;
  userId?: string | null;
  isInline?: boolean;
}

export default function GameScreen({ onClose, onGameComplete, userId, isInline = false }: GameScreenProps) {
  void onGameComplete;
  void userId;

  const cardContent = (
    <div className={`w-full max-w-4xl ${isInline ? 'min-h-[70vh] rounded-[32px] border border-slate-100 shadow-xl' : 'h-[90vh] rounded-[32px] shadow-2xl'} bg-white overflow-hidden flex flex-col relative`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B00] to-amber-500 rounded-xl flex items-center justify-center">
            <Gamepad2 size={16} />
          </div>
          <div>
            <h2 className="font-black text-sm tracking-wide uppercase">Rewards Arena</h2>
            <p className="text-[10px] text-slate-400 font-medium">Bermain & Kumpulkan Poin</p>
          </div>
        </div>
        {isInline ? (
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors cursor-pointer flex items-center justify-center"
            title="Kembali ke Menu"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors cursor-pointer flex items-center justify-center"
            title="Tutup"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 relative bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center p-6">
        {/* Iframe Placeholder untuk Game Rekan */}
        {/* Ganti src ini nanti dengan URL game rekan Anda dan passing user ID ke URL params/query */}
        <iframe
          src="about:blank"
          className="w-full h-full absolute inset-0 opacity-10 pointer-events-none"
          title="Game Partner"
        />

        <div className="z-10 w-full max-w-md text-center space-y-5">
          <div className="mx-auto w-24 h-24 rounded-[28px] bg-slate-200 flex items-center justify-center text-slate-500">
            <Gamepad2 size={42} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Game Belum Tersedia</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm mx-auto">
              Fitur game sedang dalam pengembangan dan akan segera hadir. Silakan kembali lagi nanti.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Segera hadir
          </div>
        </div>
      </div>
    </div>
  );

  if (isInline) {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl flex justify-center"
      >
        {cardContent}
      </motion.div>
    </div>
  );
}
