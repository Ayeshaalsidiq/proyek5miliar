import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, ArrowLeft, User, Loader2, QrCode } from 'lucide-react';
import { login } from '../services/smartTagApi';

interface LoginViewProps {
  onBack: () => void;
  onSuccess: (user: any) => void;
  onScanBarcode: () => void;
}

export default function LoginView({ onBack, onSuccess, onScanBarcode }: LoginViewProps) {
  const [emailNim, setEmailNim] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = emailNim.trim();
    const cleanPassword = password.trim();
    if (!cleanInput || !cleanPassword) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await login(cleanInput, cleanPassword);

      if (result.success && result.user) {
        const mappedUser = {
          id: result.user.id,
          name: result.user.name || cleanInput,
          email: result.user.email || cleanInput,
          phone: result.user.phone || '',
          nim: result.user.nim || '',
          points: Number(result.user.points ?? result.user.coin_balance ?? result.user.point_balance ?? 0),
          role: result.user.role || 'Pelanggan',
          token: result.token ?? (result as any).access_token ?? (result as any).data?.token ?? '',
        };
        onSuccess(mappedUser);
      } else {
        setError(result.message || 'Login gagal. Periksa kembali email/NIM dan password.');
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
              Email / NIM
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="text"
                required
                value={emailNim}
                onChange={(e) => setEmailNim(e.target.value)}
                placeholder="Masukkan Email atau NIM"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-orange-100 transition-all focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
              Password
            </label>
            <div className="relative">
              <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password"
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

          <button
            type="button"
            onClick={onScanBarcode}
            className="w-full bg-slate-900 text-white py-4 rounded-[24px] font-black text-base shadow-lg shadow-slate-200 flex items-center justify-center gap-3 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <QrCode size={21} className="text-orange-400" />
            <span>SCAN BARCODE SEBAGAI TAMU</span>
          </button>

          <p className="text-center text-xs font-semibold text-slate-400">
            Scan kode meja untuk masuk tanpa login
          </p>
        </form>
      </motion.div>
    </div>
  );
}
