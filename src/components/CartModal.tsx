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
  isInline?: boolean;
  orderType?: 'Dine In' | 'Takeaway' | 'Delivery FIT';
  setOrderType?: (type: 'Dine In' | 'Takeaway' | 'Delivery FIT') => void;
  deliveryAddress?: string;
  setDeliveryAddress?: (addr: string) => void;
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
  onPlayGame,
  isInline = false,
  orderType,
  setOrderType,
  deliveryAddress,
  setDeliveryAddress
}: CartModalProps) {
  const [note, setNote] = useState('');
  const [editingCartItem, setEditingCartItem] = useState<{id: string, oldNote: string, item: MenuItem} | null>(null);

  const totalPrice = cart.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className={isInline ? "fixed inset-x-0 top-20 bottom-0 z-40 w-full overflow-hidden" : "fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"}>
            {!isInline && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
            )}

            <motion.div
              initial={isInline ? { opacity: 0 } : { y: 100, opacity: 0 }}
              animate={isInline ? { opacity: 1 } : { y: 0, opacity: 1 }}
              exit={isInline ? { opacity: 0 } : { y: 100, opacity: 0 }}
              className={`w-full max-w-4xl mx-auto flex flex-col relative z-10 ${isInline ? 'bg-transparent h-full' : 'bg-white max-w-md rounded-t-[32px] sm:rounded-[40px] max-h-[90vh] shadow-2xl'}`}
            >
              <div className={`p-3 sm:p-4 flex items-center justify-between ${!isInline ? 'border-b border-slate-50' : ''} ${isInline ? 'hidden' : ''}`}>
                <div>
                  <h2 className={`font-display leading-none ${isInline ? 'text-2xl text-slate-800' : 'text-xl text-slate-900'}`}>KERANJANG</h2>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1">{cart.length} Pesanan Dipilih</p>
                </div>
                {!isInline && (
                  <button onClick={onClose} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors">
                    <X size={20} className="text-slate-400" />
                  </button>
                )}
              </div>

              <div className={`flex-1 min-h-0 space-y-2 no-scrollbar overflow-y-auto overscroll-contain ${isInline ? 'px-2 pb-60 pt-2 sm:px-3' : 'p-4'}`}>
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
                  <div className="space-y-2">
                    {cart.map((item, idx) => (
                      <motion.div 
                        key={`${item.id}-${idx}`}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex flex-col gap-2 relative ${isInline ? 'bg-white p-2 sm:p-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100' : 'pb-4 border-b border-slate-50'}`}
                      >
                        <div className="flex gap-2 sm:gap-3">
                          <div className="relative flex-shrink-0">
                            <img src={item.image} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover ring-2 ring-slate-50" referrerPolicy="no-referrer" />
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-start pt-1">
                            <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-snug mb-0.5 pr-2">{item.name}</h4>
                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Rp {(item.discountPrice || item.price).toLocaleString('id-ID')}</p>
                            <p className="font-black text-[#FF6B00] text-sm sm:text-base mt-auto">Rp {((item.discountPrice || item.price) * item.quantity).toLocaleString('id-ID')}</p>
                          </div>
                        </div>

                          <div className="flex items-center gap-2 min-w-0">
                          {item.note ? (
                              <div className="flex min-w-0 flex-1 items-center gap-2 text-[10px] text-slate-600 bg-orange-50 border border-orange-100 p-2 rounded-xl">
                              <div className="flex min-w-0 items-center gap-2">
                                <MessageSquare size={14} className="text-[#FF6B00] mt-0.5 flex-shrink-0" />
                                <span className="truncate font-medium italic leading-snug">"{item.note}"</span>
                              </div>
                              <button onClick={() => { setNote(item.note || ''); setEditingCartItem({id: item.id, oldNote: item.note || '', item: item as MenuItem}); }} className="text-[#FF6B00] font-black shrink-0 underline decoration-2 underline-offset-2">Ubah</button>
                            </div>
                          ) : (
                              <button onClick={() => { setNote(''); setEditingCartItem({id: item.id, oldNote: '', item: item as MenuItem}); }} className="flex min-w-0 flex-1 items-center gap-1.5 text-[9px] font-bold text-[#FF6B00] bg-orange-50/80 px-2 py-1.5 rounded-lg transition-colors truncate">
                              <MessageSquare size={12} />
                              <span className="truncate">Tambah Catatan</span>
                            </button>
                          )}
                          
                          <div className="flex shrink-0 items-center gap-2">
                            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                              <button
                                onClick={() => updateQuantity(item.id, item.note || '', -1)}
                                className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-100 text-slate-500 active:scale-95 transition-transform"
                              >
                                <Minus size={14} strokeWidth={2.5} />
                              </button>
                              <span className="font-black text-xs min-w-[1.5rem] text-center text-slate-800">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.note || '', 1)}
                                className="w-7 h-7 flex items-center justify-center bg-[#FF6B00] rounded-lg shadow-md shadow-orange-200 text-white active:scale-95 transition-transform"
                              >
                                <Plus size={14} strokeWidth={2.5} />
                              </button>
                            </div>
                            <button 
                              onClick={() => updateQuantity(item.id, item.note || '', -item.quantity)}
                              className="p-2 text-red-500 bg-red-50 rounded-xl active:scale-95 flex items-center gap-2 transition-transform shadow-sm"
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
                <div className={`p-3 sm:p-4 space-y-3 ${isInline ? 'absolute bottom-0 left-0 right-0 bg-white mt-1' : 'shrink-0 bg-white border-t border-slate-50'}`}>
                  
                  {/* Removed Delivery Options */}

                  <div className={`space-y-2 px-2 ${isInline ? 'bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-100' : ''}`}>
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="text-slate-600 font-black tracking-normal">Rp {totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Tax (0%)</span>
                      <span className="text-emerald-500 font-black tracking-normal">FREE</span>
                    </div>
                    <div className="pt-2 border-t border-dashed border-slate-200">
                      <div className="flex items-end justify-between gap-3">
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Total yang harus dibayar</p>
                        <p className="text-right text-2xl font-black text-[#FF6B00] tracking-tight whitespace-nowrap">Rp {totalPrice.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                  


                  <div className="pb-1 md:pb-0 px-2 sm:px-0">
  <button
    onClick={onCheckout}
    className="w-full bg-[#FF6B00] text-white py-2.5 rounded-xl font-black text-xs sm:text-sm hover:bg-[#e66000] transition-all shadow-lg shadow-orange-200 active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden group"
  >
    <span className="relative z-10 flex items-center gap-2">
      Lanjut ke Pembayaran
      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal Catatan (Overlay) ── */}
      <AnimatePresence>
        {(selectedItemForNote || editingCartItem) && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedItemForNote(null); setEditingCartItem(null); setNote(''); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-4 pb-16 relative z-10 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-lg text-slate-800">Catatan Pesanan</h2>
                <button onClick={() => { setSelectedItemForNote(null); setEditingCartItem(null); setNote(''); }} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex gap-3 mb-4 bg-slate-50 p-3 rounded-2xl">
                <img src={(selectedItemForNote || editingCartItem?.item)?.image} className="w-14 h-14 rounded-xl object-cover" referrerPolicy="no-referrer" />
                <div>
                  <h3 className="font-bold text-slate-800">{(selectedItemForNote || editingCartItem?.item)?.name}</h3>
                  <p className="text-[#FF6B00] font-bold">Rp {((selectedItemForNote || editingCartItem?.item)?.discountPrice || (selectedItemForNote || editingCartItem?.item)?.price)?.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-4 top-4 text-[#FF6B00] opacity-30 group-focus-within:opacity-100 transition-opacity">
                    <MessageSquare size={18} />
                  </div>
                  <textarea
                    placeholder="Contoh: Tidak pakai sambal, mie setengah matang..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-3 pl-10 bg-slate-50 border-2 border-slate-50 focus:border-[#FF6B00]/30 rounded-2xl focus:ring-4 focus:ring-[#FF6B00]/5 outline-none h-20 resize-none text-xs placeholder:text-slate-300 transition-all font-medium"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Saran Cepat</p>
                  <div className="flex flex-wrap gap-1.5">
                    {((selectedItemForNote || editingCartItem?.item)?.category === 'Bakso & Mie' 
                      ? ['Gak pake pedas', 'Pedes dikit', 'Banyakin kuah', 'Pisah sambal', 'Tanpa sayur']
                      : (selectedItemForNote || editingCartItem?.item)?.category === 'Aneka Nasi'
                      ? ['Pedas sedang', 'Telor ceplok', 'Tanpa sayur', 'Ekstra kerupuk', 'Pedas bgt']
                      : (selectedItemForNote || editingCartItem?.item)?.category === 'Gorengan'
                      ? ['Goreng garing', 'Ekstra saus', 'Potong kecil', 'Hangatkan']
                      : (selectedItemForNote || editingCartItem?.item)?.category === 'Ice Cream'
                      ? ['Ekstra topping', 'Sedikit manis', 'Tanpa kacang', 'Minta sendok']
                      : ['Es dikit', 'Tanpa es', 'Kurang manis', 'Ekstra gula']
                    ).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setNote(prev => prev ? `${prev}, ${suggestion}` : suggestion)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-orange-50 border border-slate-100 hover:border-orange-200 rounded-full text-[10px] font-bold text-slate-500 hover:text-[#FF6B00] transition-all active:scale-95"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      if (editingCartItem) {
                        updateQuantity(editingCartItem.id, editingCartItem.oldNote, -999);
                        addToCartWithNote(editingCartItem.item, note);
                        setEditingCartItem(null);
                      } else if (selectedItemForNote) {
                        addToCartWithNote(selectedItemForNote, note);
                      }
                      setNote('');
                      setSelectedItemForNote(null);
                    }}
                    className="px-6 py-2.5 bg-[#FF6B00] text-white rounded-xl font-bold hover:bg-[#e66000]"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
