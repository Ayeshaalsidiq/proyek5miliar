import React from 'react';
import { LayoutDashboard, ClipboardList, Gamepad2, Ticket, User } from 'lucide-react';
import { motion } from 'motion/react';

export type TabType = 'dashboard' | 'orders' | 'game' | 'voucher' | 'profile';

interface BottomNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  cartCount: number;
}

export default function BottomNavigation({ activeTab, setActiveTab, cartCount }: BottomNavigationProps) {
  const tabs = [
    { id: 'dashboard', label: 'Menu', icon: LayoutDashboard },
    { id: 'orders', label: 'Pesanan', icon: ClipboardList },
    { id: 'game', label: 'Game', icon: Gamepad2 },
    { id: 'voucher', label: 'Voucher', icon: Ticket },
    { id: 'profile', label: 'Profil', icon: User },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 shadow-[0_-8px_30px_rgb(0,0,0,0.03)] px-4 py-2 pb-5 pt-3 sm:pb-3 flex justify-around items-center">
      <div className="max-w-md w-full mx-auto flex justify-between items-center relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl relative transition-all active:scale-95 group focus:outline-none cursor-pointer"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    color: isActive ? '#FF6B00' : '#94a3b8',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`p-1.5 rounded-xl transition-colors duration-200 ${isActive ? 'bg-orange-50 text-[#FF6B00]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
              </div>

              <span
                className={`text-[9px] font-black mt-1 tracking-wider uppercase transition-colors duration-200 ${isActive ? 'text-[#FF6B00]' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-[#FF6B00]"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
