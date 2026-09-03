import React from 'react';
import { LayoutDashboard, ClipboardList, Ticket, User, QrCode } from 'lucide-react';
import { motion } from 'motion/react';

export type TabType = 'dashboard' | 'orders' | 'game' | 'voucher' | 'profile' | 'cart' | 'payment';

interface BottomNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  cartCount: number;
  onScanClick: () => void;
}

export default function BottomNavigation({ activeTab, setActiveTab, cartCount, onScanClick }: BottomNavigationProps) {
  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'orders', label: 'Pesanan', icon: ClipboardList },
    { id: 'scan', label: 'Scan', icon: QrCode, isAction: true },
    { id: 'voucher', label: 'Voucher', icon: Ticket },
    { id: 'profile', label: 'Profil', icon: User },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-light shadow-sm px-4 pt-1.5 pb-3 sm:pb-2 flex justify-around items-center h-[65px]">
      <div className="max-w-md w-full mx-auto flex justify-between items-center relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isAction = 'isAction' in tab && tab.isAction;

          if (isAction) {
            return (
              <button
                key={tab.id}
                onClick={onScanClick}
                className="flex flex-col items-center justify-center relative -translate-y-[22px] focus:outline-none cursor-pointer group active:scale-95 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-orange-500/30 border-[6px] border-white">
                  <Icon size={28} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black mt-1.5 tracking-wider uppercase text-text-dark">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl relative transition-all active:scale-95 group focus:outline-none cursor-pointer"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    color: isActive ? '#FF9F0D' : '#828282',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`p-1.5 rounded-xl transition-colors duration-200 ${isActive ? 'bg-slate-50 text-primary' : 'text-text-light group-hover:text-text-dark'
                    }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
              </div>

              <span
                className={`text-[9px] font-black mt-1 tracking-wider uppercase transition-colors duration-200 ${isActive ? 'text-primary' : 'text-text-light group-hover:text-text-dark'
                  }`}
              >
                {tab.label}
              </span>

            </button>
          );
        })}
      </div>
    </div>
  );
}
