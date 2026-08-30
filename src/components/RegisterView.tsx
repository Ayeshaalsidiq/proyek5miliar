import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, ArrowLeft, Mail, Phone, Loader2, Sparkles } from 'lucide-react';
import { registerUser } from '../services/tangolabService';

interface RegisterViewProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function RegisterView({ onBack, onSuccess }: RegisterViewProps) {
  const [id, setId] = useState('');
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await registerUser({
        id: id.trim(),
        nama: nama.trim(),
        nim: nim.trim(),
        email: email.trim(),
        phone: phone.trim()
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
        <div className="w-20 h-20 bg-blue-50 rounded-[28px] flex items-center justify-center text-blue-500 mb-8">
          <Sparkles size={40} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
              ID Pengguna
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="text"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Masukkan ID Pengguna (Contoh: U123)"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-100 transition-all focus:outline-none"
              />
            </div>
          </div>

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
              NIM
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300 text-sm">N</span>
              <input
                type="text"
                required
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="Masukkan NIM Anda"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-800 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-slate-100 flex items-center justify-center gap-2 hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'DAFTAR SEKARANG'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
