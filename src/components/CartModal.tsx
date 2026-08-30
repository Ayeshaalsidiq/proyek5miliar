import React, { useState } from 'react';
import { X, Plus, Minus, MessageSquare, ShoppingBag, Trash2, ArrowRight, Gamepad2 } from 'lucide-react';
import { CartItem, MenuItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: string, note: string, delta: number) => void;
  onCheckout: () => void;
  selectedItemForNote: MenuItem | null;
  setSelectedItemForNote: (item: MenuItem | null) => void;
  addToCartWithNote: (item: MenuItem, note: string) => void;
  onPlayGame?: () => void;
}

export default function CartModal({
  isOpen,
  onClose,
  cart,
  updateQuantity,
  onCheckout,
  selectedItemForNote,
  setSelectedItemForNote,
  addToCartWithNote,
  onPlayGame
}: CartModalProps) {
  const [note, setNote] = useState('');

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {(isOpen || selectedItemForNote) && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {selectedItemForNote ? (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 relative z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl text-slate-800">Catatan Pesanan</h2>
                <button onClick={() => setSelectedItemForNote(null)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex gap-4 mb-8 bg-slate-50 p-4 rounded-3xl">
                <img src={selectedItemForNote.image} className="w-20 h-20 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                <div>
                  <h3 className="font-bold text-slate-800">{selectedItemForNote.name}</h3>
                  <p className="text-[#FF6B00] font-bold">Rp {selectedItemForNote.price.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute left-4 top-4 text-[#FF6B00] opacity-30 group-focus-within:opacity-100 transition-opacity">
                    <MessageSquare size={18} />
                  </div>
                  <textarea
                    placeholder="Contoh: Tidak pakai sambal, mie setengah matang..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-50 focus:border-[#FF6B00]/30 rounded-[28px] focus:ring-4 focus:ring-[#FF6B00]/5 outline-none h-32 resize-none text-sm placeholder:text-slate-300 transition-all font-medium"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Saran Cepat</p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedItemForNote.category === 'Bakso & Mie' 
                      ? ['Gak pake pedas', 'Pedes dikit', 'Banyakin kuah', 'Pisah sambal', 'Tanpa sayur']
                      : selectedItemForNote.category === 'Aneka Nasi'
                      ? ['Pedas sedang', 'Telor ceplok', 'Tanpa sayur', 'Ekstra kerupuk', 'Pedas bgt']
                      : selectedItemForNote.category === 'Gorengan'
                      ? ['Goreng garing', 'Ekstra saus', 'Potong kecil', 'Hangatkan']
                      : selectedItemForNote.category === 'Ice Cream'
                      ? ['Ekstra topping', 'Sedikit manis', 'Tanpa kacang', 'Minta sendok']
                      : ['Es dikit', 'Tanpa es', 'Kurang manis', 'Ekstra gula']
                    ).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setNote(prev => prev ? `${prev}, ${suggestion}` : suggestion)}
                        className="px-4 py-2 bg-slate-50 hover:bg-orange-50 border border-slate-100 hover:border-orange-200 rounded-full text-[11px] font-bold text-slate-500 hover:text-[#FF6B00] transition-all active:scale-95"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    addToCartWithNote(selectedItemForNote, note);
                    setNote('');
                  }}
                  className="w-full bg-[#FF6B00] text-white py-4 rounded-[28px] font-bold shadow-lg shadow-orange-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Confirm & Tambah
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[40px] max-h-[90vh] flex flex-col relative z-10 shadow-2xl"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl text-slate-900 leading-none">KERANJANG</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{cart.length} Pesanan Dipilih</p>
                </div>
                <button onClick={onClose} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                {cart.length === 0 ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-24 space-y-6"
                  >
                    <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-[#FF6B00] relative">
                      <ShoppingBag size={40} />
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-[#FF6B00] rounded-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-800 font-black text-lg">Keranjang Kosong</p>
                      <p className="text-slate-400 font-medium text-sm px-10">Pilih menu favoritmu dan tambahkan ke keranjang sekarang!</p>
                    </div>
                    <button 
                      onClick={onClose}
                      className="px-8 py-3 bg-[#FF6B00] text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-100"
                    >
                      Mulai Pesan
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item, idx) => (
                      <motion.div 
                        key={`${item.id}-${idx}`}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-5 group relative"
                      >
                        <div className="relative flex-shrink-0">
                          <img src={item.image} className="w-20 h-20 rounded-[24px] object-cover ring-4 ring-slate-50 group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                          <span className="absolute -top-2 -right-2 bg-[#FF6B00] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white">{item.quantity}</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start pt-1">
                            <div>
                              <h4 className="font-bold text-slate-800 text-base leading-tight pr-4">{item.name}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Rp {item.price.toLocaleString('id-ID')}</p>
                            </div>
                            <p className="font-black text-[#FF6B00] text-base leading-none">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                          </div>
                          {item.note && (
                            <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-orange-50/50 border border-orange-100/30 p-3 rounded-2xl">
                              <MessageSquare size={12} className="text-[#FF6B00] mt-0.5 flex-shrink-0" />
                              <span className="font-medium italic line-clamp-2">"{item.note}"</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.note || '', -1)}
                                className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                              >
                                <Minus size={14} className="text-slate-400" />
                              </button>
                              <span className="font-black text-sm min-w-[2.5rem] text-center text-slate-700">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.note || '', 1)}
                                className="w-8 h-8 flex items-center justify-center bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
                              >
                                <Plus size={14} className="text-[#FF6B00]" />
                              </button>
                            </div>
                            <button 
                              onClick={() => updateQuantity(item.id, item.note || '', -item.quantity)}
                              className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 bg-white border-t border-slate-50 space-y-6">
                  <div className="space-y-3 px-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="text-slate-600 font-black tracking-normal">Rp {totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Tax (0%)</span>
                      <span className="text-emerald-500 font-black tracking-normal">FREE</span>
                    </div>
                    <div className="pt-3 border-t border-dashed border-slate-200">
                      <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Total yang harus dibayar</p>
                          <p className="text-3xl font-black text-[#FF6B00] tracking-tight">Rp {totalPrice.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  


                  <div className="pb-6 md:pb-0">
  <button
    onClick={onCheckout}
    className="w-full bg-[#FF6B00] text-white py-5 rounded-[32px] font-black text-lg hover:bg-[#e66000] transition-all shadow-2xl shadow-orange-200 active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group"
  >
    <span className="relative z-10 flex items-center gap-2">
      Lanjut ke Pembayaran
      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
    </span>
    <motion.div 
      initial={{ left: '-100%' }}
      whileHover={{ left: '100%' }}
      transition={{ duration: 0.6 }}
      className="absolute top-0 w-1/2 h-full bg-white/20 skew-x-12"
    />
  </button>
</div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
