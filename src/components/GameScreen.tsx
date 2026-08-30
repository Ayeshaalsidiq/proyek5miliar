import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Gamepad2, Award, Trophy, Zap, Star, ArrowLeft } from 'lucide-react';

interface GameScreenProps {
  onClose: () => void;
  onGameComplete: (pointsEarned: number) => void;
  userId?: string | null;
  isInline?: boolean;
}

export default function GameScreen({ onClose, onGameComplete, userId, isInline = false }: GameScreenProps) {
  const [isPlaying, setIsPlaying] = useState(true);

  // Simulasi jika platform game mengirimkan event message kembali ke web kita
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Pastikan untuk memvalidasi origin di masa depan (misal: if (event.origin !== 'https://partner-game.com') return;)
      if (event.data && event.data.type === 'GAME_COMPLETED') {
        const points = event.data.points || 0;
        setIsPlaying(false);
        onGameComplete(points);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onGameComplete]);

  // Fungsi simulasi memenangkan game (digunakan karena API asli belum ada)
  const simulateWin = () => {
    const randomPoints = Math.floor(Math.random() * 50) + 10; // 10-60 poin
    setIsPlaying(false);
    onGameComplete(randomPoints);
  };

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

        {isPlaying && (
          <div className="z-10 w-full max-w-md space-y-8">
            {/* Hero section */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative mx-auto w-28 h-28"
              >
                <div className="w-full h-full bg-gradient-to-br from-[#FF6B00] to-amber-500 rounded-[32px] flex items-center justify-center shadow-lg shadow-orange-200 rotate-6">
                  <Trophy size={48} className="text-white -rotate-6" />
                </div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute -top-2 -right-2 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Star size={18} className="text-white" fill="white" />
                </motion.div>
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  Mainkan Game, Raih Poin!
                </h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm mx-auto">
                  Nikmati permainan seru sambil menunggu pesananmu. Setiap kemenangan memberikanmu poin rewards yang bisa ditukar dengan voucher diskon.
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-2 text-[#FF6B00]">
                  <Gamepad2 size={18} />
                </div>
                <p className="text-[10px] font-bold text-slate-500 leading-tight">Main Game Seru</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2 text-amber-500">
                  <Zap size={18} />
                </div>
                <p className="text-[10px] font-bold text-slate-500 leading-tight">Dapat Poin Instan</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2 text-emerald-500">
                  <Award size={18} />
                </div>
                <p className="text-[10px] font-bold text-slate-500 leading-tight">Tukar Voucher</p>
              </div>
            </div>

            {/* User ID info */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Player ID</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{userId || 'GUEST'}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600">Online</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => {
                const uId = userId || 'GUEST';
                window.open(`https://ngolab-gami.kolab.top?userId=${encodeURIComponent(uId)}`, '_blank');
              }}
              className="w-full bg-gradient-to-r from-[#FF6B00] to-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-all flex justify-center items-center gap-2.5 cursor-pointer hover:shadow-xl hover:shadow-orange-200/60"
            >
              <Gamepad2 size={20} />
              Mulai Bermain
            </button>

            <p className="text-center text-[10px] text-slate-400 font-medium">
              Bermain gratis • Poin otomatis masuk ke akun Anda
            </p>
          </div>
        )}
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
