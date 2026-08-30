import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, ArrowLeft, User, Loader2 } from 'lucide-react';
import { validateUserLogin } from '../services/tangolabService';

interface LoginViewProps {
  onBack: () => void;
  onSuccess: (user: any) => void;
}

export default function LoginView({ onBack, onSuccess }: LoginViewProps) {
  const [emailNim, setEmailNim] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = emailNim.trim();
    if (!cleanInput) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await validateUserLogin(cleanInput);

      if (result.status === 'success' && result.user) {
        // Map Tangolab user fields to app's expected format
        const user = result.user as any;
        const mappedUser = {
          id: user.id,
          name: user.nama || user.name || user.id,
          nama: user.nama || user.name || user.id,
          nim: user.nim || '',
          email: user.email || '',
          coin_balance: user.coin_balance ?? 0,
          points: user.coin_balance ?? 0,
          role: user.role || 'Pelanggan',
          avatar_url: user.avatar_url || '',
        };
        onSuccess(mappedUser);
      } else {
        setError(result.message || 'Login gagal. ID / NIM tidak ditemukan.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi. Pastikan server aktif.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-white flex flex-col p-6">
      <header className="flex items-center gap-4 mb-10">
        <button 
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-400"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-slate-800">Login</h1>
      </header>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm mx-auto"
      >
        <div className="w-20 h-20 bg-orange-50 rounded-[28px] flex items-center justify-center text-[#FF6B00] mb-8">
          <LogIn size={40} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
              NIM / User ID Tangolab
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="text"
                required
                value={emailNim}
                onChange={(e) => setEmailNim(e.target.value)}
                placeholder="Masukkan NIM atau User ID Anda"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-orange-100 transition-all focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FF6B00] text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-orange-100 flex items-center justify-center gap-2 hover:bg-[#e66000] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
          >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              <span className="text-sm">Memverifikasi...</span>
            </>
          ) : 'MASUK'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
