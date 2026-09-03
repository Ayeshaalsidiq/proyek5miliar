import { MapPin, Search, Coins, LogOut, History, User, Gamepad2, Ticket, ShoppingCart } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface HeaderProps {
  tableNumber: string;
  isGuest?: boolean;
  zoneName?: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  points: number;
  onPointsClick: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  activeTab?: string;
  cartCount: number;
  onCartClick: () => void;
}

export default function Header({ tableNumber, isGuest, zoneName, searchQuery, setSearchQuery, points, onPointsClick, onLogout, onProfileClick, activeTab = 'dashboard', cartCount, onCartClick }: HeaderProps) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 20) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const isDashboard = activeTab === 'dashboard';

  return (
    <motion.header 
      initial={false}
      animate={{
        y: hidden ? "-100%" : 0,
        paddingBottom: isDashboard ? 80 : 16,
        borderBottomLeftRadius: isDashboard ? 32 : 24,
        borderBottomRightRadius: isDashboard ? 32 : 24,
      }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="sticky top-0 z-30 flex flex-col shadow-sm overflow-hidden bg-white"
      style={{
        paddingTop: '0.75rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-[#FF6B00] to-[#FF9F0D] z-0 pointer-events-none"
        initial={false}
        animate={{ 
          y: isDashboard ? 0 : "-100%",
          opacity: isDashboard ? 1 : 0
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
      
      <motion.div 
        className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between gap-3"
        animate={{
          paddingBottom: isDashboard ? 0 : 4,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden transition-all duration-300 ${isDashboard ? 'border-[3px] border-white' : 'border border-slate-200'}`}>
            <img src="/logo-ngolab.png" alt="Ngolab Logo" className="w-full h-full object-contain rounded-full p-0.5" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Points Badge */}
          {!isGuest && (
            <button 
              onClick={onPointsClick}
              className={`backdrop-blur-sm border px-3 py-1.5 rounded-[15px] items-center gap-2 transition-colors cursor-pointer active:scale-95 hidden md:flex ${
                isDashboard 
                  ? 'bg-white/20 border-white/30 hover:bg-white/30 text-white' 
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <div className="bg-white p-1 rounded-full text-orange-500 shadow-sm">
                <Coins size={12} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className={`text-[8px] font-black uppercase leading-none opacity-90 ${isDashboard ? 'text-white' : 'text-slate-500'}`}>Poin Saya</p>
                <p className="font-bold text-[11px] leading-tight">{points.toLocaleString('id-ID')}</p>
              </div>
            </button>
          )}

          <button 
            onClick={onCartClick}
            className={`w-10 h-10 backdrop-blur-sm rounded-xl flex items-center justify-center transition-colors active:scale-95 border relative ${
              isDashboard 
                ? 'bg-white/20 text-white hover:bg-white/30 border-white/30' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
            title="Keranjang"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm"></span>
            )}
          </button>

          {!isGuest && (
            <button 
              onClick={onProfileClick}
              className={`w-10 h-10 backdrop-blur-sm rounded-xl items-center justify-center transition-colors active:scale-95 border hidden md:flex ${
                isDashboard 
                  ? 'bg-white/20 text-white hover:bg-white/30 border-white/30' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
              }`}
              title="Profil Saya"
            >
              <User size={18} />
            </button>
          )}

          <button 
            onClick={onLogout}
            className={`w-10 h-10 backdrop-blur-sm rounded-xl flex items-center justify-center transition-colors active:scale-95 border ${
              isDashboard 
                ? 'bg-white/20 text-white hover:bg-white/30 border-white/30' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
            title="Keluar"
          >
            <LogOut size={18} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isDashboard && tableNumber !== 'Belum Scan' && tableNumber !== 'Mode Tamu' && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto w-full relative group z-10"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors" size={16} />
            <input
              type="text"
              placeholder="Mau makan apa hari ini?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-border-light rounded-2xl py-3 pl-12 pr-4 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-light text-text-dark"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
