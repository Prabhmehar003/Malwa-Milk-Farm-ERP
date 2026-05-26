import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({ title, value, change, icon: Icon, isPremium = false }) => {
  const isPositive = change >= 0;

  return (
    <div
      className={`glass-card p-6 ${
        isPremium ? 'border-[#D4AF37] glow-gold' : ''
      } hover:-translate-y-1 transition-transform duration-300`}
      data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isPremium
              ? 'bg-gradient-to-br from-[#D4AF37] to-[#FBBF24]'
              : 'bg-blue-600/20 border border-blue-500/30'
          }`}
        >
          <Icon
            className={isPremium ? 'w-6 h-6 text-black' : 'w-6 h-6 text-blue-400'}
            strokeWidth={1.5}
          />
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <h3 className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">{title}</h3>
      <p
        className={`text-3xl font-bold font-mono ${
          isPremium ? 'text-gradient-gold' : 'text-white'
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export default KPICard;