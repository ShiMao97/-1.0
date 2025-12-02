import React, { useEffect, useRef, useState } from 'react';
import { Scientist, LogEntry, BattleState, SkillCard, SkillType, Field, BattleEvent } from '../types';
import { Card } from './Card';
import { HandCard } from './HandCard';
import { GENERIC_CARDS, BATTLE_EVENTS, UNIVERSAL_CARDS } from '../constants';
import { generateBattleNarration } from '../services/geminiService';

interface BattleArenaProps {
  playerHero: Scientist;
  opponentHero: Scientist;
  onGameOver: (winner: 'PLAYER' | 'OPPONENT') => void;
  onExit: () => void;
}

const MAX_HAND_SIZE = 5;
const STARTING_ENERGY = 2; // Slightly more starting energy since regen is slower
const MAX_ENERGY = 10;
const DECK_SIZE = 20;

// Game Settings
const ENERGY_REGEN_RATE = 3500; // Slowed down: 1 energy every 3.5s
const AUTO_DRAW_RATE = 4000; // Draw card every 4s
const EVENT_RATE = 15000; // Event every 15s

export const BattleArena: React.FC<BattleArenaProps> = ({ playerHero, opponentHero, onGameOver, onExit }) => {
  // Game State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeEvent, setActiveEvent] = useState<BattleEvent | null>(null);
  
  // Selection State for Combos
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  // Entities State
  const [player, setPlayer] = useState<BattleState>({
    hp: playerHero.hp,
    maxHp: playerHero.maxHp,
    shield: 0,
    energy: STARTING_ENERGY,
    maxEnergy: MAX_ENERGY,
    hand: [],
    deck: [],
    discard: [],
    isCasting: false,
    castEndTime: 0
  });

  const [opponent, setOpponent] = useState<BattleState>({
    hp: opponentHero.hp,
    maxHp: opponentHero.maxHp,
    shield: 0,
    energy: STARTING_ENERGY,
    maxEnergy: MAX_ENERGY,
    hand: [], 
    deck: [],
    discard: [],
    isCasting: false,
    castEndTime: 0
  });

  // Refs for async access to latest state in intervals
  const playerRef = useRef(player);
  const opponentRef = useRef(opponent);
  const gameOverRef = useRef(false);

  // Sync refs with state
  useEffect(() => { playerRef.current = player; }, [player]);
  useEffect(() => { opponentRef.current = opponent; }, [opponent]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // --- Initialization ---
  useEffect(() => {
    const buildDeck = (hero: Scientist): SkillCard[] => {
      let deck: SkillCard[] = [];
      
      // 1. Signature Cards: Add all 5 unique cards x 2 copies = 10 cards
      hero.deck.forEach(card => {
        deck.push({ ...card, id: `${card.id}_1` });
        deck.push({ ...card, id: `${card.id}_2` });
      });

      // 2. Field Specific Cards: Add 6 random cards from field pool
      const fieldCards = GENERIC_CARDS[hero.field] || GENERIC_CARDS[Field.PHYSICS];
      for (let i = 0; i < 6; i++) {
        const randomCard = fieldCards[Math.floor(Math.random() * fieldCards.length)];
        deck.push({ ...randomCard, id: `${randomCard.id}_f_${i}_${Date.now()}` });
      }

      // 3. Universal Cards: Add 4 random cards from universal pool
      for (let i = 0; i < 4; i++) {
         const randomCard = UNIVERSAL_CARDS[Math.floor(Math.random() * UNIVERSAL_CARDS.length)];
         deck.push({ ...randomCard, id: `${randomCard.id}_u_${i}_${Date.now()}` });
      }

      return shuffle(deck);
    };

    const pDeck = buildDeck(playerHero);
    const oDeck = buildDeck(opponentHero);

    setPlayer(p => ({ ...p, deck: pDeck }));
    setOpponent(o => ({ ...o, deck: oDeck }));
    
    // Initial Draw
    drawCards(true, 4); // Start with 4 cards
    drawCards(false, 4);
    
    addLog('System', '战斗开始！全员准备！');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // --- Real-time Game Loops ---

  // 1. Energy Regeneration Loop
  useEffect(() => {
    const energyInterval = setInterval(() => {
      if (gameOverRef.current) return;
      
      setPlayer(p => ({ ...p, energy: Math.min(p.maxEnergy, p.energy + 1) }));
      setOpponent(o => ({ ...o, energy: Math.min(o.maxEnergy, o.energy + 1) }));
    }, ENERGY_REGEN_RATE);

    return () => clearInterval(energyInterval);
  }, []);

  // 2. Auto-Draw Loop
  useEffect(() => {
    const drawInterval = setInterval(() => {
      if (gameOverRef.current) return;
      drawCards(true, 1);
      drawCards(false, 1);
    }, AUTO_DRAW_RATE);

    return () => clearInterval(drawInterval);
  }, []);

  // 3. Random Events Loop
  useEffect(() => {
    const eventInterval = setInterval(() => {
      if (gameOverRef.current) return;
      triggerRandomEvent();
    }, EVENT_RATE);

    return () => clearInterval(eventInterval);
  }, []);

  // 4. Opponent AI Loop (Think fast!)
  useEffect(() => {
    const aiInterval = setInterval(() => {
      if (gameOverRef.current) return;
      runOpponentAI();
    }, 1000); // Check every second

    return () => clearInterval(aiInterval);
  }, []);

  // --- Helpers ---
  const shuffle = (array: SkillCard[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const drawCards = (isPlayer: boolean, count: number) => {
    const targetRef = isPlayer ? playerRef : opponentRef;
    const targetSetter = isPlayer ? setPlayer : setOpponent;

    const current = targetRef.current;
    if (current.hand.length >= MAX_HAND_SIZE) return;

    let newHand = [...current.hand];
    let newDeck = [...current.deck];

    for (let i = 0; i < count; i++) {
      if (newDeck.length === 0) {
        // Reshuffle discard (Mix of field and universal)
         const generics = GENERIC_CARDS[isPlayer ? playerHero.field : opponentHero.field] || GENERIC_CARDS[Field.PHYSICS];
         // 50/50 chance to get Field or Universal card on deck empty regeneration
         const pool = Math.random() > 0.5 ? generics : UNIVERSAL_CARDS;
         const randomCard = pool[Math.floor(Math.random() * pool.length)];
         newDeck.push({ ...randomCard, id: `${randomCard.id}_regen_${Date.now()}` });
      }
      
      const card = newDeck.shift();
      if (card && newHand.length < MAX_HAND_SIZE) {
        newHand.push(card);
      }
    }

    targetSetter(prev => ({ ...prev, hand: newHand, deck: newDeck }));
  };

  const addLog = (speaker: LogEntry['speaker'], message: string) => {
    setLogs(prev => [...prev, { timestamp: Date.now(), speaker, message }]);
  };

  const triggerRandomEvent = () => {
    const event = BATTLE_EVENTS[Math.floor(Math.random() * BATTLE_EVENTS.length)];
    setActiveEvent(event);
    setTimeout(() => setActiveEvent(null), 3500);
    
    addLog('System', `🎲 随机事件: ${event.name}`);

    // Apply logic to PLAYER for simplicity
    setPlayer(prev => applyEventEffect(prev, event));
  };

  const applyEventEffect = (state: BattleState, event: BattleEvent): BattleState => {
      let newState = { ...state };
      switch(event.id) {
        case 'GRANT': newState.energy = Math.min(newState.maxEnergy, newState.energy + 2); break;
        case 'MALFUNCTION': newState.energy = Math.max(0, newState.energy - 2); break;
        case 'COFFEE': newState.hp = Math.min(newState.maxHp, newState.hp + 10); break;
        case 'ACCIDENT': newState.hp = Math.max(1, newState.hp - 5); break;
        case 'BREAKTHROUGH': newState.shield += 15; break;
        case 'REVIEW': 
            // Silence/Stun mechanism (Global Cooldown extension)
            newState.isCasting = true;
            newState.castEndTime = Date.now() + 3000;
            setTimeout(() => setPlayer(p => ({...p, isCasting: false})), 3000);
            break;
        case 'INSIGHT': 
            newState.energy = newState.maxEnergy; 
            break;
    }
    return newState;
  }

  // --- Player Combo Logic ---

  const handleCardClick = (card: SkillCard) => {
    if (player.isCasting) return;

    setSelectedCardIds(prev => {
      // Toggle selection
      if (prev.includes(card.id)) {
        return prev.filter(id => id !== card.id);
      } else {
        // Validation: Max 3 cards
        if (prev.length >= 3) return prev;
        
        // Validation: Check energy
        const currentCost = prev.reduce((sum, id) => {
            const c = player.hand.find(h => h.id === id);
            return sum + (c ? c.cost : 0);
        }, 0);
        
        if (currentCost + card.cost <= player.energy) {
            return [...prev, card.id];
        } else {
            // Provide visual feedback? (Maybe shake animation later)
            return prev;
        }
      }
    });
  };

  const castCombo = async () => {
      if (selectedCardIds.length === 0 || player.isCasting) return;

      const cardsToPlay = player.hand.filter(c => selectedCardIds.includes(c.id));
      if (cardsToPlay.length === 0) return;

      const totalCost = cardsToPlay.reduce((sum, c) => sum + c.cost, 0);
      
      // Calculate Cooldown: Sum of individual CDs, but slightly reduced for combo efficiency (0.8x)
      const rawTotalCD = cardsToPlay.reduce((sum, c) => sum + (c.cooldown || 1000), 0);
      const comboCooldown = Math.max(1000, rawTotalCD * 0.8);

      // Apply Multiplier for Combo Length
      // 1 Card: 1x, 2 Cards: 1.2x, 3 Cards: 1.5x
      const multiplier = cardsToPlay.length === 1 ? 1 : cardsToPlay.length === 2 ? 1.2 : 1.5;

      // 1. Pay Cost & Trigger Cooldown
      setPlayer(p => ({ 
        ...p, 
        energy: p.energy - totalCost,
        hand: p.hand.filter(c => !selectedCardIds.includes(c.id)),
        discard: [...p.discard, ...cardsToPlay],
        isCasting: true,
        castEndTime: Date.now() + comboCooldown
      }));
      
      setSelectedCardIds([]);

      setTimeout(() => {
          setPlayer(p => ({...p, isCasting: false}));
      }, comboCooldown);

      // 2. Execute Effects & Narrate
      // We execute them "simultaneously" in logic, but loop for effect application
      for (const card of cardsToPlay) {
          applyCardEffect(card, true, multiplier);
          
          // Narration
          const attackerName = playerHero.name;
          const defenderName = opponentHero.name;
          
          // Just narrate the first one fully, or simplified
          // Let's fire and forget narration request for each to populate log
          generateBattleNarration(attackerName, defenderName, card.name, Math.floor(card.value * multiplier), card.type)
            .then(text => addLog('Player', cardsToPlay.length > 1 ? `(连击 x${multiplier}) ${text}` : text));
      }
  };

  // --- Combat Logic ---

  // Helper to play a single card immediately (used by AI)
  const playSingleCardInstant = (card: SkillCard, isPlayer: boolean) => {
    const state = isPlayer ? playerRef.current : opponentRef.current;
    
    if (state.isCasting) return;
    if (state.energy < card.cost) return;

    const cooldownMs = card.cooldown || 1000;
    
    if (isPlayer) {
       // Player uses Combo system now, this is fallback or specific use
    } else {
      setOpponent(o => ({
        ...o,
        energy: o.energy - card.cost,
        hand: o.hand.filter(c => c.id !== card.id),
        isCasting: true,
        castEndTime: Date.now() + cooldownMs
      }));
       setTimeout(() => {
          setOpponent(o => ({...o, isCasting: false}));
      }, cooldownMs);

      const attackerName = opponentHero.name;
      const defenderName = playerHero.name;
      generateBattleNarration(attackerName, defenderName, card.name, card.value, card.type)
        .then(text => addLog('Opponent', text));

      applyCardEffect(card, false, 1.0);
    }
  };

  const applyCardEffect = (card: SkillCard, isPlayer: boolean, multiplier: number) => {
      const targetSetter = isPlayer ? setOpponent : setPlayer;
      const selfSetter = isPlayer ? setPlayer : setOpponent;
      
      const finalValue = Math.floor(card.value * multiplier);

      if (card.type === SkillType.ATTACK) {
        targetSetter(prev => {
            let dmg = finalValue;
            let newShield = prev.shield;
            if (prev.shield > 0) {
                if (prev.shield >= dmg) {
                    newShield -= dmg;
                    dmg = 0;
                } else {
                    dmg -= prev.shield;
                    newShield = 0;
                }
            }
            return { ...prev, hp: Math.max(0, prev.hp - dmg), shield: newShield };
        });
      } else if (card.type === SkillType.DEFENSE) {
          selfSetter(prev => ({ ...prev, shield: prev.shield + finalValue }));
      } else if (card.type === SkillType.HEAL) {
          selfSetter(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + finalValue) }));
      } else if (card.type === SkillType.BUFF) {
          // Buff usually gives energy or cards in this simplified version
          // If value is small (<= 5), assume energy.
          selfSetter(prev => ({ ...prev, energy: Math.min(prev.maxEnergy, prev.energy + finalValue) }));
      } else if (card.type === SkillType.DEBUFF) {
          // Debuff drains enemy energy
          targetSetter(prev => ({ ...prev, energy: Math.max(0, prev.energy - finalValue) }));
      }
  };

  // Watch for Win/Loss
  useEffect(() => {
    if (opponent.hp <= 0 && !gameOverRef.current) {
        gameOverRef.current = true;
        onGameOver('PLAYER');
    }
    else if (player.hp <= 0 && !gameOverRef.current) {
        gameOverRef.current = true;
        onGameOver('OPPONENT');
    }
  }, [player.hp, opponent.hp, onGameOver]);


  // --- AI Logic ---
  const runOpponentAI = () => {
    const ai = opponentRef.current;
    if (ai.isCasting) return;

    // AI Logic: Play single cards for now, but maybe prioritize combos later?
    // Keep it simple: Play best affordable card
    const playableCards = ai.hand.filter(c => c.cost <= ai.energy);
    
    if (playableCards.length === 0) return;

    // Strategy
    let cardToPlay = playableCards[0];
    const healCard = playableCards.find(c => c.type === SkillType.HEAL);
    const attackCard = playableCards.find(c => c.type === SkillType.ATTACK);
    const debuffCard = playableCards.find(c => c.type === SkillType.DEBUFF);

    if (ai.hp < ai.maxHp * 0.4 && healCard) {
        cardToPlay = healCard;
    } else if (debuffCard && Math.random() > 0.7) {
        // Occasional disruption
        cardToPlay = debuffCard;
    } else if (attackCard) {
        cardToPlay = attackCard;
    }

    playSingleCardInstant(cardToPlay, false);
  };

  // derived state for UI
  const selectedCards = player.hand.filter(c => selectedCardIds.includes(c.id));
  const totalSelectedCost = selectedCards.reduce((sum, c) => sum + c.cost, 0);

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto px-2 py-4 md:px-4 md:py-6 overflow-hidden relative">
      
      {/* Event Notification Overlay */}
      {activeEvent && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 animate-[bounce_1s_infinite]">
          <div className={`
             px-6 py-3 rounded-lg shadow-2xl border-2 flex items-center gap-3 backdrop-blur-md
             ${activeEvent.type === 'POSITIVE' ? 'bg-green-900/90 border-green-400 text-green-100' : 'bg-red-900/90 border-red-400 text-red-100'}
             animate-in fade-in slide-in-from-top-4 duration-500
          `}>
             <div className="text-2xl">{activeEvent.type === 'POSITIVE' ? '🍀' : '⚠️'}</div>
             <div>
                <h4 className="font-bold text-lg">{activeEvent.name}</h4>
                <p className="text-sm opacity-90">{activeEvent.description}</p>
             </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-2">
        <button onClick={onExit} className="text-slate-400 hover:text-white px-3 py-1 rounded hover:bg-slate-800 transition text-sm">
          ← 退出
        </button>
        <div className="text-center">
            <div className="text-sm text-slate-400 font-mono tracking-widest uppercase">实时对战</div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
               <span className="animate-pulse text-green-500">● Live</span>
               <span>{((Date.now() / 1000) % 60).toFixed(0)}s Ticker</span>
            </div>
        </div>
        <div className="w-20"></div>
      </div>

      {/* Battlefield (Heroes) */}
      <div className="flex-grow flex items-center justify-center gap-4 md:gap-16 relative min-h-0">
        
        {/* Player Hero */}
        <div className="flex flex-col items-center gap-2 relative">
            {player.isCasting && (
                <div className="absolute -top-8 text-yellow-400 font-bold animate-pulse z-10 text-shadow-glow">
                    施法中...
                </div>
            )}
            <Card 
                scientist={playerHero} 
                currentHp={player.hp} 
                maxHp={player.maxHp} 
                shield={player.shield}
            />
            {/* Player Energy Bar */}
            <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-700 mt-1 relative overflow-hidden group">
                <div 
                    className="h-full bg-science-accent transition-all duration-1000 ease-linear relative"
                    style={{ width: `${(player.energy / player.maxEnergy) * 100}%` }}
                >
                    {/* Tick markers for energy */}
                    <div className="absolute inset-0 flex justify-between px-1 opacity-20">
                         {Array.from({length: player.maxEnergy}).map((_, i) => <div key={i} className="w-[1px] h-full bg-black"></div>)}
                    </div>
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow-md">
                    ⚡ {player.energy} / {player.maxEnergy}
                </span>
            </div>
        </div>

        {/* VS / Logs Area for Desktop */}
        <div className="hidden md:flex flex-col w-64 h-64 bg-black/40 rounded-xl border border-slate-800 p-2 overflow-y-auto scrollbar-hide text-xs font-mono">
            {logs.map((log, idx) => (
                <div key={idx} className="mb-1.5 border-b border-slate-800/50 pb-1">
                <span className={`font-bold ${log.speaker === 'Player' ? 'text-science-primary' : log.speaker === 'Opponent' ? 'text-red-400' : 'text-slate-400'}`}>
                    {log.speaker === 'Player' ? '我方' : log.speaker === 'Opponent' ? '敌方' : '系统'}:
                </span>
                <span className="text-slate-300 ml-1 block">{log.message}</span>
                </div>
            ))}
            <div ref={logsEndRef} />
        </div>

        {/* Opponent Hero */}
        <div className="flex flex-col items-center gap-2 relative">
          {opponent.isCasting && (
                <div className="absolute -top-8 text-red-400 font-bold animate-pulse z-10 text-shadow-glow">
                    施法中...
                </div>
            )}
          <Card 
            scientist={opponentHero} 
            currentHp={opponent.hp} 
            maxHp={opponent.maxHp}
            shield={opponent.shield}
            isEnemy 
          />
           {/* Opponent Energy Bar (Visual only, to show threat) */}
           <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-700 mt-1 relative overflow-hidden opacity-70">
                <div 
                    className="h-full bg-red-600 transition-all duration-1000 ease-linear"
                    style={{ width: `${(opponent.energy / opponent.maxEnergy) * 100}%` }}
                />
            </div>
        </div>
      </div>

      {/* Mobile Logs Overlay */}
      <div className="md:hidden h-20 w-full bg-black/40 rounded border border-slate-800 p-2 overflow-y-auto text-xs font-mono mb-2">
          {logs.slice(-3).map((log, idx) => (
              <div key={idx} className="mb-1 text-slate-300">
                  <span className={`${log.speaker === 'Player' ? 'text-science-primary' : log.speaker === 'Opponent' ? 'text-red-400' : 'text-slate-400'}`}>
                      {log.speaker === 'Player' ? '>' : log.speaker === 'Opponent' ? '!' : '#'}
                  </span> {log.message}
              </div>
          ))}
      </div>

      {/* Player Controls Area - New Flex Row Layout */}
      <div className="mt-2 h-48 md:h-64 flex flex-row items-end gap-2">
        
        {/* Left: Hand (Scrollable) */}
        <div className="flex-1 flex justify-center md:justify-start items-end gap-2 md:gap-4 overflow-x-auto overflow-y-visible pb-4 pt-8 px-2 min-h-[220px]">
           {player.hand.map((card, idx) => {
               // Check if selectable logic
               const isSelected = selectedCardIds.includes(card.id);
               // Can select if (already selected) OR (not maxed AND affordable cost)
               const canSelect = isSelected || (selectedCardIds.length < 3 && (totalSelectedCost + card.cost <= player.energy));

               return (
                <div key={card.id + idx} className={`transform transition-transform duration-200 ${isSelected ? '-translate-y-6' : ''}`} style={{ zIndex: isSelected ? 30 : 10 }}>
                   <HandCard 
                      card={card} 
                      onClick={() => handleCardClick(card)}
                      disabled={false}
                      isAffordable={canSelect} // Use affordable prop to show if it CAN be added to combo
                      isSelected={isSelected}
                      isGlobalCooldown={player.isCasting}
                   />
               </div>
               );
           })}
           {player.hand.length === 0 && (
               <div className="flex flex-col items-center justify-center h-40 text-slate-500 animate-pulse w-full">
                   <div className="text-2xl mb-2">🎴</div>
                   <div>等待抽牌...</div>
               </div>
           )}
        </div>

        {/* Right: Action Panel */}
        <div className="w-40 md:w-48 flex-shrink-0 flex flex-col items-center justify-center p-2 border-l border-slate-700/30 bg-slate-900/20 h-full rounded-r-xl">
             <div className="h-24 flex items-center justify-center w-full">
                {selectedCards.length > 0 ? (
                    <button
                        onClick={castCombo}
                        className="w-full bg-gradient-to-r from-science-primary to-blue-600 text-white font-bold py-3 px-2 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.6)] animate-in fade-in zoom-in duration-300 hover:scale-105 active:scale-95 flex flex-col items-center gap-1"
                    >
                        <span className="text-lg leading-none">⚡ 出招</span>
                        <div className="flex items-center gap-2 text-xs opacity-90">
                             <span className="bg-black/30 px-2 rounded">Cost: {totalSelectedCost}</span>
                        </div>
                        {selectedCards.length > 1 && (
                            <span className="text-yellow-300 text-xs font-black animate-pulse">
                                连击加成 x{selectedCards.length === 2 ? '1.2' : '1.5'}
                            </span>
                        )}
                    </button>
                ) : (
                    <div className="text-center text-slate-500 text-sm">
                        <div className="mb-1 text-2xl opacity-50">👆</div>
                        <div>选择卡牌</div>
                        <div className="text-xs opacity-50">最多3张连击</div>
                    </div>
                )}
             </div>
             
             {/* Status Info */}
             <div className="mt-4 text-center">
                 <div className={`text-xs ${player.isCasting ? 'text-yellow-400 font-bold' : 'text-slate-400'}`}>
                    {player.isCasting ? (
                        <span className="flex items-center gap-1 justify-center">
                            <span className="animate-spin">⏳</span> 冷却中...
                        </span>
                    ) : (
                        <span>准备就绪</span>
                    )}
                 </div>
                 <div className="text-[10px] text-slate-500 mt-1">
                     能量回复: +1 / 3.5s
                 </div>
             </div>
        </div>

      </div>
    </div>
  );
};