import React from 'react';
import { Category } from '../types';
import { Soup, IceCream, UtensilsCrossed, LayoutGrid, ChefHat, Coffee } from 'lucide-react';
import { motion } from 'motion/react';

interface CategoryFilterProps {
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
}

const CATEGORIES_DATA: { 
  name: Category; 
  icon: any; 
  baseClass: string; 
  activeClass: string; 
}[] = [
  { 
    name: 'Semua', 
    icon: LayoutGrid, 
    baseClass: 'bg-orange-50 text-orange-500 border-orange-100', 
    activeClass: 'bg-orange-500 text-white shadow-md shadow-orange-500/30 border-orange-500' 
  },
  { 
    name: 'Bakso & Mie', 
    icon: Soup, 
    baseClass: 'bg-red-50 text-red-500 border-red-100', 
    activeClass: 'bg-red-500 text-white shadow-md shadow-red-500/30 border-red-500' 
  },
  { 
    name: 'Aneka Nasi', 
    icon: ChefHat, 
    baseClass: 'bg-amber-50 text-amber-600 border-amber-100', 
    activeClass: 'bg-amber-500 text-white shadow-md shadow-amber-500/30 border-amber-500' 
  },
  { 
    name: 'Gorengan', 
    icon: UtensilsCrossed, 
    baseClass: 'bg-yellow-50 text-yellow-600 border-yellow-100', 
    activeClass: 'bg-yellow-500 text-white shadow-md shadow-yellow-500/30 border-yellow-500' 
  },
  { 
    name: 'Ice Cream', 
    icon: IceCream, 
    baseClass: 'bg-cyan-50 text-cyan-500 border-cyan-100', 
    activeClass: 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30 border-cyan-500' 
  },
  { 
    name: 'Minuman', 
    icon: Coffee, 
    baseClass: 'bg-blue-50 text-blue-500 border-blue-100', 
    activeClass: 'bg-blue-500 text-white shadow-md shadow-blue-500/30 border-blue-500' 
  },
];

export default function CategoryFilter({ activeCategory, setActiveCategory }: CategoryFilterProps) {
  return (
    <div className="flex gap-4 sm:gap-6 overflow-x-auto px-4 py-4 -mx-4 sm:mx-0 sm:px-0 no-scrollbar scroll-smooth after:content-[''] after:w-1 after:shrink-0 sm:after:hidden">
      {CATEGORIES_DATA.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.name;
        return (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className="flex flex-col items-center gap-2 group outline-none shrink-0 relative"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 border relative z-0 ${
                isActive
                  ? 'border-transparent text-white'
                  : `${cat.baseClass} hover:opacity-80`
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryBg"
                  className={`absolute inset-0 rounded-full -z-10 ${cat.activeClass}`}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
            </motion.div>
            <span
              className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-colors mt-1 whitespace-nowrap ${
                isActive ? 'text-primary' : 'text-text-light'
              }`}
            >
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
