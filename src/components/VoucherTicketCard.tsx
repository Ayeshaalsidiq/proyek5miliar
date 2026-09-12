import React from 'react';
import { ChevronRight, Coins, Ticket } from 'lucide-react';

interface VoucherTicketCardProps {
  title: string;
  discountText?: string;
  points?: number;
  code?: string;
  actionLabel: string;
  onAction?: () => void;
  disabled?: boolean;
  isRedeemed?: boolean;
  onClick?: () => void;
}

export default function VoucherTicketCard({
  title,
  discountText,
  points,
  code,
  actionLabel,
  onAction,
  disabled = false,
  isRedeemed = false,
  onClick,
}: VoucherTicketCardProps) {
  const hasPoints = points !== undefined;
  const isActionButton = hasPoints;

  return (
    <div
      onClick={onClick}
      className={`ticket-card ticket-card--unified transition-all shadow-sm ${
        onClick ? 'cursor-pointer active:scale-[0.98]' : ''
      } ${isRedeemed ? 'border-slate-200 opacity-60 grayscale' : 'border-slate-200'}`}
    >
      <div className="ticket-card__info ticket-card__unified-info bg-slate-50 px-4 py-3.5 flex items-center gap-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-5 pointer-events-none">
          <Ticket size={100} className="-rotate-12 translate-x-4 text-slate-900" />
        </div>
        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-[#FF6B00] shrink-0 z-10">
          <Ticket size={17} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0 z-10">
          <p className="text-slate-800 font-black text-sm leading-tight line-clamp-2">{title}</p>
          <p className="text-[#FF6B00] font-black text-[10px] uppercase tracking-wider mt-1">PROMO</p>
        </div>
        {discountText && (
          <div className="ticket-card__discount bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 text-center shadow-sm z-10 shrink-0">
            <p className="text-[#FF6B00] font-black text-base leading-none whitespace-nowrap">{discountText}</p>
          </div>
        )}
      </div>

      <div className="ticket-card__action ticket-card__unified-action bg-white px-3.5 flex flex-col items-center justify-center gap-1">
        {hasPoints ? (
          <div className="flex items-center gap-1.5 text-[#FF6B00] shrink-0">
            <Coins size={14} className="text-[#FF6B00]" strokeWidth={2.5} />
            <p className="font-black text-[#FF6B00] text-base leading-none">{points}</p>
          </div>
        ) : (
          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase leading-tight max-w-[82px] break-words">
            {code || 'VOUCHER'}
          </span>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            onAction?.();
          }}
          className={isActionButton
            ? `font-black text-[10px] underline underline-offset-2 transition-all active:scale-95 whitespace-nowrap ${
                !disabled ? 'text-[#FF6B00] hover:text-[#e66000]' : 'text-slate-400 cursor-not-allowed'
              }`
            : 'text-[10px] font-bold text-[#FF6B00] whitespace-nowrap flex items-center gap-0.5 disabled:text-slate-400'}
        >
          {actionLabel}
          {!isActionButton && <ChevronRight size={14} />}
        </button>
      </div>
    </div>
  );
}
