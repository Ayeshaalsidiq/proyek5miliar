import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, QrCode, X, Loader2 } from 'lucide-react';
import { login } from '../services/smartTagApi';

interface WelcomeScreenProps {
  onRegister: () => void;
  onSuccess: (user: any) => void;
  onScanBarcode: () => void;
}

export default function WelcomeScreen({ onRegister, onSuccess, onScanBarcode }: WelcomeScreenProps) {
  const [showNfcModal, setShowNfcModal] = useState(false);
  const [tagId, setTagId] = useState('');
  const [isLoadingNfc, setIsLoadingNfc] = useState(false);
  const [errorNfc, setErrorNfc] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');

  useEffect(() => {
    if (showNfcModal && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [showNfcModal]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = email.trim();
    const cleanPassword = password.trim();
    if (!cleanInput || !cleanPassword) return;

    setIsLoadingLogin(true);
    setErrorLogin('');

    try {
      const result = await login(cleanInput, cleanPassword);

      if (result.success && result.user) {
        const mappedUser = {
          id: result.user.id,
          name: result.user.name || cleanInput,
          email: result.user.email || cleanInput,
          phone: result.user.phone || '',
          nim: result.user.nim || '',
          points: result.user.points || 0,
          role: result.user.role || 'Pelanggan',
          token: result.token,
        };
        onSuccess(mappedUser);
      } else {
        setErrorLogin(result.message || 'Login gagal. Periksa kembali email/NIM dan password.');
      }
    } catch (err) {
      setErrorLogin('Terjadi kesalahan koneksi. Pastikan server aktif.');
    } finally {
      setIsLoadingLogin(false);
    }
  };

  const handleNfcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = tagId.trim();
    if (!cleanTag) return;

    setIsLoadingNfc(true);
    setErrorNfc('');

    try {
      const data = await login(cleanTag, cleanTag);
      if (data && data.success && data.user) {
        onSuccess({
          id: data.user.id,
          name: data.user.name || cleanTag,
          email: data.user.email || cleanTag,
          phone: data.user.phone || '',
          nim: data.user.nim || '',
          points: data.user.points || 0,
          role: data.user.role || 'Pelanggan',
        });
        setShowNfcModal(false);
      } else {
        setErrorNfc('Barcode tidak terdaftar di sistem.');
      }
    } catch (err) {
      setErrorNfc('Terjadi kesalahan koneksi');
    } finally {
      setIsLoadingNfc(false);
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
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center p-6 overflow-y-auto">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] aspect-square bg-orange-500/20 rounded-full blur-[100px] opacity-50" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] aspect-square bg-[#FF6B00]/20 rounded-full blur-[100px] opacity-30" />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center relative z-10 my-auto shrink-0">
        {/* Logo — tanpa latar, ukuran kecil */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6"
        >
          <img
            src="/ngolab logo png.png"
            alt="Ngolab Logo"
            className="w-24 h-24 object-contain"
            style={{ mixBlendMode: 'multiply' }}
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100 space-y-6"
        >
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
                Email / NIM
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan Email atau NIM"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-orange-100 transition-all focus:outline-none"
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
                  placeholder="Masukkan Password"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-orange-100 transition-all focus:outline-none"
                />
              </div>
            </div>

            {errorLogin && (
              <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-3 rounded-xl">
                {errorLogin}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoadingLogin}
              className="w-full bg-[#FF6B00] text-white py-4 rounded-[24px] font-black text-lg shadow-lg shadow-orange-100 flex items-center justify-center gap-2 hover:bg-[#e66000] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoadingLogin ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span className="text-sm">Memverifikasi...</span>
                </>
              ) : 'MASUK'}
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-4 text-slate-300 text-xs font-bold uppercase tracking-widest">Atau</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button
            type="button"
            onClick={onScanBarcode}
            className="w-full bg-slate-100 text-slate-700 p-4 rounded-[24px] font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-3 cursor-pointer border border-slate-200"
          >
            <span>Lanjut sebagai Guest</span>
          </button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-slate-400 font-medium">Belum punya akun?</p>
          <button 
            onClick={onRegister}
            className="text-[#FF6B00] font-black mt-1 hover:underline underline-offset-4 cursor-pointer"
          >
            Daftar Sekarang
          </button>
        </motion.div>
      </div>

      {/* Barcode Scan Modal */}
      <AnimatePresence>
        {showNfcModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isLoadingNfc) setShowNfcModal(false); }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[36px] p-8 relative z-10 text-center space-y-6 shadow-2xl border border-slate-100"
            >
              <button
                onClick={() => setShowNfcModal(false)}
                disabled={isLoadingNfc}
                className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="pt-4 space-y-4">
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-20 h-20 bg-orange-50 text-[#FF6B00] rounded-full flex items-center justify-center shadow-inner"
                  >
                    <QrCode size={36} />
                  </motion.div>
                  {/* Glowing rings */}
                  <motion.div
                    animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 border-2 border-orange-400 rounded-full"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-800">Scan Barcode</h3>
                  <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-xs mx-auto">
                    Arahkan barcode Anda pada area scanner atau masukkan nomor barcode Anda secara manual di bawah.
                  </p>
                </div>
              </div>

              <form onSubmit={handleNfcSubmit} className="space-y-4">
                <input
                  type="text"
                  ref={inputRef}
                  required
                  disabled={isLoadingNfc}
                  value={tagId}
                  onChange={(e) => setTagId(e.target.value)}
                  placeholder="Masukkan Nomor Tag (Contoh: TAG12345)"
                  className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl py-3.5 px-4 text-center font-black text-slate-700 tracking-wider placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all font-mono"
                />

                {errorNfc && (
                  <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-xl">
                    {errorNfc}
                  </p>
                )}

                <div className="flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={isLoadingNfc || !tagId.trim()}
                    className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-slate-200 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isLoadingNfc ? 'Mengecek Kartu...' : 'Hubungkan'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    disabled={isLoadingNfc}
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
