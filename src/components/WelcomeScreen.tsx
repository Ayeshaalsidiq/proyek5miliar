import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogIn, ChevronRight, Sparkles, X, Wifi } from 'lucide-react';
import { scanRFIDTag } from '../services/tangolabService';

interface WelcomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
  onGuest: () => void;
  onNfcLogin: (user: any) => void;
}

export default function WelcomeScreen({ onLogin, onRegister, onGuest, onNfcLogin }: WelcomeScreenProps) {
  const [showNfcModal, setShowNfcModal] = useState(false);
  const [tagId, setTagId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNfcModal && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [showNfcModal]);

  const handleNfcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = tagId.trim();
    if (!cleanTag) return;

    setIsLoading(true);
    setError('');

    try {
      const data = await scanRFIDTag(cleanTag);
      if (data && (data.status === 'success' || data.user)) {
        onNfcLogin(data.user);
        setShowNfcModal(false);
      } else {
        setError('RFID / Smart Tag tidak terdaftar di sistem.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateScan = () => {
    setTagId('TAG12345');
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.value = 'TAG12345';
      }
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleNfcSubmit(fakeEvent);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] aspect-square bg-orange-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] aspect-square bg-blue-50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center text-center relative z-10">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-[#FF6B00] rounded-[32px] flex items-center justify-center shadow-2xl shadow-orange-200 mb-8 relative"
        >
          <Sparkles size={40} className="text-white" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-[#FF6B00] rounded-[32px]"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 mb-10"
        >
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            Menu <span className="text-[#FF6B00]">Mas Yanto</span>
          </h1>
          <p className="text-slate-400 font-bold text-sm leading-relaxed px-4">
            Nikmati kelezatan Bakso Mas Yanto dengan pemesanan yang mudah dan cepat.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full space-y-3"
        >
          {/* RFID Option */}
          <button
            onClick={() => setShowNfcModal(true)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] transition-all flex items-center justify-between px-8 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-xl">
                <Wifi size={22} className="rotate-90 animate-pulse" />
              </div>
              <span>Scan RFID / Smart Tag</span>
            </div>
            <ChevronRight size={20} className="opacity-50" />
          </button>

          {/* Login Option */}
          <button
            onClick={onLogin}
            className="w-full bg-[#FF6B00] text-white p-4 rounded-[24px] font-black text-lg shadow-xl shadow-orange-100 hover:bg-[#e66000] active:scale-[0.98] transition-all flex items-center justify-between px-8 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-xl">
                <LogIn size={22} />
              </div>
              <span>Login NIM / ID</span>
            </div>
            <ChevronRight size={20} className="opacity-50" />
          </button>

          {/* Register Option */}
          <button
            onClick={onRegister}
            className="w-full bg-slate-800 text-white p-4 rounded-[24px] font-black text-lg shadow-xl shadow-slate-100 hover:bg-slate-900 active:scale-[0.98] transition-all flex items-center justify-between px-8 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2 rounded-xl">
                <User size={22} />
              </div>
              <span>Register</span>
            </div>
            <ChevronRight size={20} className="opacity-50" />
          </button>

          {/* Guest Option */}
          <button
            onClick={onGuest}
            className="w-full bg-blue-50 text-blue-600 p-4 rounded-[24px] font-black text-lg hover:bg-blue-100 active:scale-[0.98] transition-all flex items-center justify-between px-8 group border border-blue-100 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-xl border border-blue-100">
                <User size={22} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <span>Guest Mode</span>
            </div>
            <ChevronRight size={20} className="text-blue-300 group-hover:text-blue-400" />
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]"
        >
          Bakso Mas Yanto • Est. 2024
        </motion.p>
      </div>

      {/* RFID NFC Scan Modal */}
      <AnimatePresence>
        {showNfcModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isLoading) setShowNfcModal(false); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[36px] p-8 relative z-10 text-center space-y-6 shadow-2xl border border-slate-100"
            >
              <button
                onClick={() => setShowNfcModal(false)}
                disabled={isLoading}
                className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="pt-4 space-y-4">
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shadow-inner"
                  >
                    <Wifi size={36} className="rotate-90 animate-pulse" />
                  </motion.div>
                  {/* Glowing rings */}
                  <motion.div
                    animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 border-2 border-indigo-400 rounded-full"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-800">Scan RFID / Smart Tag</h3>
                  <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-xs mx-auto">
                    Arahkan kartu RFID / NFC Anda pada area scanner atau masukkan nomor tag Anda secara manual di bawah.
                  </p>
                </div>
              </div>

              <form onSubmit={handleNfcSubmit} className="space-y-4">
                <input
                  type="text"
                  ref={inputRef}
                  required
                  disabled={isLoading}
                  value={tagId}
                  onChange={(e) => setTagId(e.target.value)}
                  placeholder="Masukkan Nomor Tag (Contoh: TAG12345)"
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl py-3.5 px-4 text-center font-black text-slate-700 tracking-wider placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                />

                {error && (
                  <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-xl">
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={isLoading || !tagId.trim()}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isLoading ? 'Mengecek Kartu...' : 'Hubungkan'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    disabled={isLoading}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Simulasi Scan Kartu (TAG12345)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
