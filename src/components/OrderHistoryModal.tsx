import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  ShoppingBag, 
  Star, 
  MessageSquare, 
  Search, 
  Award, 
  TrendingUp, 
  Wallet, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  RefreshCw, 
  Eye, 
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import OrderDetailScreen from './OrderDetailScreen';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onViewReceipt: (order: Order) => void;
  isInline?: boolean;
  onReorder?: (order: Order) => void;
  onStartOrdering?: () => void;
}

export default function OrderHistoryModal({ 
  isOpen, 
  onClose, 
  orders, 
  onViewReceipt, 
  isInline = false,
  onReorder,
  onStartOrdering
}: OrderHistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Helper status mapping
  const getStatusConfig = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING' || s === 'MENUNGGU') {
      return {
        label: 'Menunggu',
        bgColor: 'bg-amber-50 border border-amber-100',
        textColor: 'text-amber-600',
        dotColor: 'bg-amber-500',
        icon: <Clock size={10} className="animate-spin-slow" />,
        pulse: true
      };
    }
    if (s === 'DIPROSES' || s === 'SEDANG DISIAPKAN' || s === 'PROSES' || s === 'SIAP DISAJIKAN' || s === 'SIAP') {
      return {
        label: s === 'SIAP DISAJIKAN' || s === 'SIAP' ? 'Siap Sajikan' : 'Dimasak',
        bgColor: 'bg-blue-50 border border-blue-100',
        textColor: 'text-blue-600',
        dotColor: 'bg-blue-500',
        icon: <Clock size={10} className="animate-pulse" />,
        pulse: true
      };
    }
    if (s === 'SELESAI') {
      return {
        label: 'Selesai',
        bgColor: 'bg-emerald-50 border border-emerald-100',
        textColor: 'text-emerald-600',
        dotColor: 'bg-emerald-500',
        icon: <CheckCircle2 size={10} />,
        pulse: false
      };
    }
    if (s === 'DIBATALKAN' || s === 'BATAL') {
      return {
        label: 'Batal',
        bgColor: 'bg-rose-50 border border-rose-100',
        textColor: 'text-rose-600',
        dotColor: 'bg-rose-500',
        icon: <XCircle size={10} />,
        pulse: false
      };
    }
    return {
      label: status,
      bgColor: 'bg-slate-50 border border-slate-100',
      textColor: 'text-slate-600',
      dotColor: 'bg-slate-400',
      icon: <HelpCircle size={10} />,
      pulse: false
    };
  };

  // Compute stats metrics
  const stats = useMemo(() => {
    let totalSpend = 0;
    let totalOrders = orders.length;
    let totalPoints = 0;

    orders.forEach(order => {
      const s = (order.status || '').toUpperCase();
      if (s !== 'DIBATALKAN' && s !== 'BATAL') {
        totalSpend += order.total;
        totalPoints += order.pointsEarned || 0;
      }
    });

    return { totalSpend, totalOrders, totalPoints };
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Status Filter Tab
      const s = (order.status || '').toUpperCase();
      const isCancelled = s === 'DIBATALKAN' || s === 'BATAL';
      const isCompleted = s === 'SELESAI';
      const isActive = !isCancelled && !isCompleted;

      if (statusFilter === 'ACTIVE' && !isActive) return false;
      if (statusFilter === 'COMPLETED' && !isCompleted) return false;
      if (statusFilter === 'CANCELLED' && !isCancelled) return false;

      // 2. Search Query Filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchId = order.id.toLowerCase().includes(q);
        const matchItem = order.items.some(item => item.name.toLowerCase().includes(q));
        const matchTable = order.tableNumber.toLowerCase().includes(q);
        const matchCustomer = order.customerName?.toLowerCase().includes(q);
        return matchId || matchItem || matchTable || matchCustomer;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const cardContent = selectedOrder ? (
    <OrderDetailScreen 
      order={selectedOrder} 
      onBack={() => setSelectedOrder(null)} 
      onReorder={onReorder} 
    />
  ) : (
    <div className={`bg-white w-full max-w-2xl mx-auto sm:rounded-[24px] overflow-hidden ${isInline ? 'mt-4 pb-20' : 'shadow-sm border border-border-light'} flex flex-col relative z-10`}>
      {/* Sticky Search */}
      {orders.length > 0 && (
        <div className="p-5 pb-4 border-b border-border-light bg-white shrink-0">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3.5 text-text-light" />
            <input
              type="text"
              placeholder="Cari pesanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-border-light focus:border-primary focus:bg-white rounded-xl text-sm font-semibold focus:outline-none transition-all placeholder-text-light text-text-dark"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 hover:bg-slate-200 text-text-light hover:text-text-dark rounded-full transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content list */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50 no-scrollbar ${isInline ? 'max-h-[70vh]' : 'max-h-[65vh]'}`}>
        {orders.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="bg-orange-50 text-primary p-6 rounded-full mb-5 border border-orange-100">
              <ShoppingBag size={40} strokeWidth={1.5} />
            </div>
            <h4 className="font-extrabold text-text-dark text-lg">Belum Ada Pesanan</h4>
            <p className="text-text-light text-xs font-semibold max-w-xs mt-2 leading-relaxed">
              Dapur kami menanti pesanan pertama Anda. Pesan sekarang!
            </p>
            {onStartOrdering && (
              <button
                onClick={onStartOrdering}
                className="mt-6 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-2xl active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                Mulai Memesan
              </button>
            )}
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Search/Filter Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-border-light p-6">
            <div className="bg-slate-50 p-4 rounded-full text-text-light mb-4 shadow-sm border border-border-light">
              <Search size={28} />
            </div>
            <h4 className="font-bold text-text-dark text-sm">Pesanan Tidak Ditemukan</h4>
            <p className="text-text-light text-xs font-medium mt-1">
              Tidak ada riwayat yang sesuai.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-border-light rounded-xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col text-left"
              >
                {/* Header: Meja & Tanggal */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Meja {order.tableNumber}
                    </span>
                    <span className="text-text-dark font-extrabold text-[11px] sm:text-xs">
                      Pesanan #{order.id.slice(0, 6)}
                    </span>
                  </div>
                  <span className="text-text-light text-[10px] font-semibold">
                    {order.timestamp}
                  </span>
                </div>

                {/* Body: Images and Total Price */}
                <div 
                  onClick={() => setSelectedOrder(order)}
                  className="flex justify-between items-start cursor-pointer group hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                >
                  <div className="flex gap-2.5 flex-1 overflow-hidden">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="w-[60px] sm:w-[70px] shrink-0 flex flex-col">
                        <div className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] relative rounded-lg overflow-hidden border border-border-light bg-slate-50">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          {idx === 2 && order.items.length > 3 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-medium text-text-dark mt-1.5 leading-tight line-clamp-2">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-right shrink-0 ml-3 pt-2">
                    <p className="font-extrabold text-text-dark text-[13px] sm:text-[15px] leading-none">
                      Rp{order.total.toLocaleString('id-ID')}
                    </p>
                    <p className="text-[10px] sm:text-xs text-text-light mt-2 flex items-center justify-end gap-0.5 font-semibold group-hover:text-primary transition-colors">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} menu <ChevronRight size={14} />
                    </p>
                  </div>
                </div>

                {/* Footer: Status and Actions */}
                <div className="border-t border-border-light mt-3.5 pt-3.5 flex items-center justify-between gap-3">
                  <span className={`text-xs font-bold ${statusConfig.textColor}`}>
                    {statusConfig.label}
                  </span>
                  
                  <div className="flex items-center gap-2.5">
                    {/* Review/Rating */}
                    {!order.rating ? (
                      <button className="px-3 py-1.5 border border-border-light text-text-light hover:text-text-dark hover:bg-slate-50 rounded-md text-[10px] sm:text-xs font-semibold transition-colors">
                        Beri Penilaian
                      </button>
                    ) : (
                      <div className="flex gap-0.5 mr-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={10}
                            className={star <= (order.rating || 0) ? "text-primary fill-primary" : "text-slate-200"}
                          />
                        ))}
                      </div>
                    )}

                    {/* Reorder Button */}
                    {onReorder && (order.status === 'SELESAI' || order.status === 'Selesai') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorder(order);
                        }}
                        className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-md text-[10px] sm:text-xs font-bold transition-colors active:scale-95"
                      >
                        Pesan lagi
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );

  if (isInline) {
    return cardContent;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-lg flex flex-col max-h-[85vh] relative z-10"
          >
            {cardContent}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
