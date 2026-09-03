import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, ArrowLeft, Mail, Phone, Loader2, Sparkles, LogIn, Lock } from 'lucide-react';
import { registerUser } from '../services/tangolabService';

interface RegisterViewProps {
  onBack: () => void;
  onSuccess: () => void;
  onGuest?: () => void;
}

export default function RegisterView({ onBack, onSuccess, onGuest }: RegisterViewProps) {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await registerUser({
        id: email.trim(),
        nama: nama.trim(),
        nim: '',
        email: email.trim(),
        phone: phone.trim()
        // password: password.trim() // If backend starts accepting password
      });

      if (data && data.status === 'success') {
        alert('Registrasi sukses! Silakan login.');
        onSuccess();
      } else {
        setError(data?.message || 'Registrasi gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-white flex flex-col p-6 overflow-y-auto">
      <header className="flex items-center gap-4 mb-8 flex-shrink-0">
        <button 
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-400"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-slate-800">Daftar Akun</h1>
      </header>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm mx-auto pb-12"
      >
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-100 transition-all focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: nama@kolab.top"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-100 transition-all focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password Anda"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-100 transition-all focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
              Nomor Handphone
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-100 transition-all focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-3 rounded-xl">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-4 mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-800 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-slate-100 flex items-center justify-center gap-2 hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'DAFTAR SEKARANG'}
            </button>
            
            {onGuest && (
              <>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-bold uppercase tracking-widest">Atau</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  type="button"
                  onClick={onGuest}
                  className="w-full bg-white text-slate-600 border border-slate-200 py-4 rounded-[24px] font-bold text-sm shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <User size={18} />
                  MASUK GUEST MODE
                </button>
              </>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}

