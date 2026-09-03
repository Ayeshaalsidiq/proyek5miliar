import React from 'react';
import { Plus } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ item, onAdd }) => {
  return (
    <div 
      onClick={() => item.inStock && onAdd(item)}
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-border-light flex flex-col group active:scale-95 transition-all duration-300 ${item.inStock ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : 'cursor-not-allowed grayscale-[0.8] opacity-75'}`}
    >
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${item.inStock ? 'group-hover:scale-105' : ''}`}
          referrerPolicy="no-referrer"
        />
        {item.isPromo && item.inStock && (
          <div className="absolute top-2 left-2">
            <span className="text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-primary rounded-lg shadow-sm">Promo</span>
          </div>
        )}
        {item.isAirGesture && item.inStock && (
          <div className="absolute top-2 right-2 z-10">
            <span className="text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-cyan-600 rounded-lg shadow-lg">Air Gesture</span>
          </div>
        )}
        {!item.inStock && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[2px]">
            <div className="bg-white/90 px-4 py-2 rounded-2xl shadow-xl border border-white/50 transform -rotate-12">
              <span className="text-slate-900 text-[11px] font-black uppercase tracking-[0.2em]">Habis</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-1 justify-between gap-1">
        <div>
          <h3 className={`font-bold text-text-dark text-sm leading-snug line-clamp-2 ${!item.inStock ? 'text-slate-400' : ''}`}>
            {item.name}
          </h3>
          <p className="font-bold text-text-light text-[10px] uppercase tracking-wider mt-1">{item.category}</p>
        </div>

        <div className="flex flex-col gap-1 mt-auto">
          {item.inStock ? (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                Tersedia {item.stock !== undefined ? `• ${item.stock} Porsi` : ''}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Stok Habis
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {item.discountPrice ? (
                <>
                  <p className="text-[10px] text-text-light line-through">
                    Rp {item.price.toLocaleString('id-ID')}
                  </p>
                  <p className={`font-bold text-sm ${item.inStock ? 'text-primary' : 'text-slate-400'}`}>
                    Rp {item.discountPrice.toLocaleString('id-ID')}
                  </p>
                </>
              ) : (
                <p className={`font-bold text-sm ${item.inStock ? 'text-primary' : 'text-slate-400'}`}>
                  Rp {item.price.toLocaleString('id-ID')}
                </p>
              )}
            </div>
            <div className={`${item.inStock ? 'bg-primary shadow-sm group-hover:bg-primary-hover' : 'bg-slate-200'} text-white p-1.5 rounded-xl transition-colors`}>
              <Plus size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
