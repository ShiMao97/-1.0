import React from 'react';
import { Scientist, Field } from '../types';
import { FIELD_COLORS, FIELD_ICONS } from '../constants';

interface CardProps {
  scientist: Scientist;
  currentHp: number;
  maxHp: number;
  shield?: number;
  isEnemy?: boolean;
}

export const Card: React.FC<CardProps> = ({ scientist, currentHp, maxHp, shield = 0, isEnemy }) => {
  const colorClass = FIELD_COLORS[scientist.field] || FIELD_COLORS[Field.PHYSICS];
  const seed = scientist.id; 
  // Use DiceBear Pixel Art API with higher resolution/scale settings for "more pixels" look
  const imageUrl = scientist.imageUrl || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(seed)}&scale=120&size=128`;

  return (
    <div 
      className={`
        relative w-48 h-64 md:w-56 md:h-72 rounded-xl border-2 bg-slate-900/90 backdrop-blur-sm
        flex flex-col p-3 select-none transition-all duration-300
        ${colorClass}
        ${isEnemy ? 'border-red-500/30' : 'shadow-lg'}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="overflow-hidden">
          <h3 className="font-bold text-base leading-tight text-white truncate">{scientist.name}</h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase truncate">{scientist.title}</p>
        </div>
        <div className="text-xl" title={scientist.field}>{FIELD_ICONS[scientist.field]}</div>
      </div>

      {/* Image */}
      <div className="relative w-full flex-grow mb-2 rounded-lg overflow-hidden border border-slate-700 bg-indigo-950/50 shadow-inner">
         <img 
           src={imageUrl} 
           alt={scientist.name} 
           className="w-full h-full object-cover opacity-100"
           style={{ imageRendering: 'pixelated' }}
         />
      </div>

      {/* Status Bars */}
      <div className="space-y-1 mb-2">
        {/* HP */}
        <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
           <div 
              className={`h-full transition-all duration-500 ${isEnemy ? 'bg-red-500' : 'bg-science-success'}`}
              style={{ width: `${(currentHp / maxHp) * 100}%` }} 
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
              HP: {currentHp}/{maxHp}
            </span>
        </div>
        
        {/* Shield - Only show if active */}
        {shield > 0 && (
          <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden border border-blue-800">
             <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: '100%' }} 
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                🛡️ 护盾: {shield}
              </span>
          </div>
        )}
      </div>

      {/* Quote */}
      <div className="pt-1 border-t border-slate-700/50">
        <p className="text-[9px] italic text-slate-500 text-center line-clamp-2">"{scientist.quote}"</p>
      </div>

      {/* Status Overlay (Dead) */}
      {currentHp <= 0 && (
        <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center rounded-xl">
          <span className="text-2xl font-bold text-red-600 border-4 border-red-600 p-2 transform -rotate-12 uppercase">
            已击败
          </span>
        </div>
      )}
    </div>
  );
};