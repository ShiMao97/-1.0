import React from 'react';
import { SkillCard, SkillType, Field } from '../types';
import { FIELD_COLORS } from '../constants';

interface HandCardProps {
  card: SkillCard;
  onClick: () => void;
  disabled?: boolean;
  isAffordable?: boolean;
  isGlobalCooldown?: boolean;
  isSelected?: boolean;
}

const TYPE_ICONS: Record<SkillType, string> = {
  [SkillType.ATTACK]: '⚔️',
  [SkillType.DEFENSE]: '🛡️',
  [SkillType.HEAL]: '💚',
  [SkillType.BUFF]: '⚡',
  [SkillType.DEBUFF]: '💢'
};

const TYPE_LABELS: Record<SkillType, string> = {
  [SkillType.ATTACK]: '攻击',
  [SkillType.DEFENSE]: '防御',
  [SkillType.HEAL]: '治疗',
  [SkillType.BUFF]: '增益',
  [SkillType.DEBUFF]: '干扰'
};

export const HandCard: React.FC<HandCardProps> = ({ 
  card, 
  onClick, 
  disabled, 
  isAffordable = true, 
  isGlobalCooldown = false,
  isSelected = false
}) => {
  const colorClass = FIELD_COLORS[card.field] || FIELD_COLORS[Field.PHYSICS];
  
  // Calculate display cooldown in seconds
  const cdSeconds = (card.cooldown / 1000).toFixed(1);

  // If selected, it should look active regardless of affordability (logic handled by parent)
  // But visually we want to show it's "ready" in the combo slot
  const isInteractable = !disabled && (isAffordable || isSelected) && !isGlobalCooldown;

  return (
    <div
      onClick={!disabled && !isGlobalCooldown ? onClick : undefined}
      className={`
        relative w-32 h-44 md:w-36 md:h-52 rounded-lg border bg-slate-900 
        flex flex-col p-2 select-none transition-all duration-200 overflow-hidden flex-shrink-0
        ${colorClass}
        ${isSelected ? 'ring-4 ring-science-accent -translate-y-2 scale-105 z-30 shadow-[0_0_20px_rgba(245,158,11,0.5)]' : ''}
        ${!isSelected && isInteractable ? 'hover:-translate-y-2 hover:scale-105 cursor-pointer shadow-xl z-10 hover:z-20' : ''}
        ${(!isAffordable && !isSelected) || isGlobalCooldown ? 'opacity-90 grayscale-[0.3]' : ''}
      `}
    >
      {/* Cooldown Overlay */}
      {isGlobalCooldown && (
          <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center backdrop-blur-[1px]">
             <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-science-accent/10 pointer-events-none z-0"></div>
      )}

      {/* Cost Badge */}
      <div className={`
        absolute -top-2 -left-2 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-black shadow-md z-20
        ${(isAffordable || isSelected) ? 'bg-science-accent border-white' : 'bg-slate-600 border-red-500 text-slate-300'}
      `}>
        {card.cost}
      </div>
      
      {/* Cooldown Badge (Bottom Right) */}
      <div className="absolute -top-2 -right-2 bg-slate-800 border border-slate-600 text-[10px] text-slate-300 px-1.5 py-0.5 rounded-full z-20 flex items-center gap-1">
         <span>⏳</span> {cdSeconds}s
      </div>

      {/* Title */}
      <div className="text-center mt-3 mb-1 relative z-10">
        <h4 className="font-bold text-xs text-white leading-tight line-clamp-2 h-8 flex items-center justify-center">
          {card.name}
        </h4>
      </div>

      {/* Image/Icon Placeholder */}
      <div className="flex-grow bg-slate-800/50 rounded border border-slate-700/50 flex flex-col items-center justify-center mb-1 relative z-10">
        <span className="text-xl mb-1">{TYPE_ICONS[card.type]}</span>
        <span className="text-[9px] text-slate-400 uppercase tracking-wider">{TYPE_LABELS[card.type]}</span>
      </div>

      {/* Description */}
      <div className="bg-slate-950/40 rounded p-1 h-14 overflow-hidden relative z-10">
        <p className="text-[9px] text-slate-300 text-center leading-snug">
          {card.description}
        </p>
      </div>

      {/* Footer Value */}
      <div className="mt-1 text-center relative z-10">
        <span className={`text-xs font-bold ${
          card.type === SkillType.ATTACK ? 'text-red-400' : 
          card.type === SkillType.HEAL ? 'text-green-400' : 
          card.type === SkillType.DEFENSE ? 'text-blue-400' :
          card.type === SkillType.BUFF ? 'text-yellow-400' : 'text-purple-400'
        }`}>
          {card.type === SkillType.ATTACK && "伤害: "}
          {card.type === SkillType.DEFENSE && "护盾: "}
          {card.type === SkillType.HEAL && "回复: "}
          {card.type === SkillType.BUFF && "能量: +"}
          {card.type === SkillType.DEBUFF && "敌能量: -"}
          {card.value}
        </span>
      </div>
      
      {/* Not Affordable Overlay (Subtle) */}
      {!isAffordable && !isSelected && !isGlobalCooldown && (
         <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none border-2 border-red-500/50 rounded-lg"></div>
      )}
    </div>
  );
};