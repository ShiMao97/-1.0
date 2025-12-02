import React, { useState } from 'react';
import { GamePhase, Scientist, Field } from './types';
import { STARTER_SCIENTISTS, FIELD_DISPLAY_NAMES } from './constants';
import { Card } from './components/Card';
import { BattleArena } from './components/BattleArena';
import { generateScientistCard } from './services/geminiService';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.MENU);
  const [selectedHero, setSelectedHero] = useState<Scientist | null>(null);
  const [opponentHero, setOpponentHero] = useState<Scientist | null>(null);
  const [customName, setCustomName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [battleResult, setBattleResult] = useState<'PLAYER' | 'OPPONENT' | null>(null);
  
  // Selection Tabs
  const [activeTab, setActiveTab] = useState<Field>(Field.PHYSICS);

  const startGame = (player: Scientist) => {
    setSelectedHero(player);
    // Pick random opponent distinct from player
    let enemy = STARTER_SCIENTISTS[Math.floor(Math.random() * STARTER_SCIENTISTS.length)];
    // Try to find one that isn't the player, 10 attempts
    for(let i=0; i<10; i++) {
        if (enemy.id !== player.id) break;
        enemy = STARTER_SCIENTISTS[Math.floor(Math.random() * STARTER_SCIENTISTS.length)];
    }
    setOpponentHero(enemy);
    setPhase(GamePhase.BATTLE);
  };

  const handleGenerateCustom = async () => {
    if (!customName.trim()) return;
    setIsGenerating(true);
    setPhase(GamePhase.LOADING_GENERATE);
    
    const newHero = await generateScientistCard(customName);
    setIsGenerating(false);
    
    if (newHero) {
      startGame(newHero);
    } else {
      alert("无法生成科学家数据。请尝试其他名字或检查 API 密钥。");
      setPhase(GamePhase.MENU);
    }
  };

  const handleGameOver = (winner: 'PLAYER' | 'OPPONENT') => {
    setBattleResult(winner);
    setPhase(GamePhase.GAME_OVER);
  };

  const resetGame = () => {
    setPhase(GamePhase.MENU);
    setSelectedHero(null);
    setOpponentHero(null);
    setBattleResult(null);
    setCustomName('');
  };

  // Filter scientists by active tab
  const displayedScientists = STARTER_SCIENTISTS.filter(s => s.field === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-science-dark to-slate-900 text-slate-200 font-sans selection:bg-science-primary selection:text-black">
      
      {/* --- MENU PHASE --- */}
      {phase === GamePhase.MENU && (
        <div className="container mx-auto px-4 py-10 flex flex-col items-center">
          <header className="mb-8 text-center">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-science-primary to-science-accent mb-4 drop-shadow-lg">
              思维对决
            </h1>
            <p className="text-xl text-slate-400">科学家卡牌对战 - 选择你的英雄</p>
          </header>

          <div className="w-full max-w-7xl">
            {/* Field Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                {Object.values(Field).filter(f => f !== 'Astronomy').map((field) => (
                    <button
                        key={field}
                        onClick={() => setActiveTab(field)}
                        className={`px-4 py-2 rounded-full font-bold transition-all ${
                            activeTab === field 
                            ? 'bg-science-primary text-slate-900 scale-105 shadow-lg' 
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        {FIELD_DISPLAY_NAMES[field]}
                    </button>
                ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {displayedScientists.map(hero => (
                <div key={hero.id} className="transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer flex flex-col items-center" onClick={() => startGame(hero)}>
                  <div className="scale-90">
                    <Card 
                        scientist={hero}
                        currentHp={hero.hp}
                        maxHp={hero.maxHp}
                    />
                  </div>
                  <button className="mt-2 bg-science-primary/10 border border-science-primary text-science-primary px-6 py-1 rounded-full text-sm font-bold hover:bg-science-primary hover:text-white transition">
                      选择
                  </button>
                </div>
              ))}
            </div>

            <div className="max-w-md mx-auto bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-bold text-science-accent mb-2 flex items-center gap-2">
                <span>✨</span> 创建新科学家 (AI)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                由 Gemini 驱动。输入名字（如“尼古拉·特斯拉”）生成独特英雄和专属技能牌。
              </p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="输入科学家名字..."
                  className="flex-grow bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-science-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateCustom()}
                />
                <button 
                  onClick={handleGenerateCustom}
                  disabled={!customName}
                  className="bg-science-primary text-science-dark font-bold px-4 py-2 rounded hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  生成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LOADING PHASE --- */}
      {phase === GamePhase.LOADING_GENERATE && (
        <div className="h-screen flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-science-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl text-science-primary font-mono animate-pulse">正在构建理论模型...</p>
          <p className="text-sm text-slate-500 mt-2">正在为 {customName} 撰写论文与技能牌</p>
        </div>
      )}

      {/* --- BATTLE PHASE --- */}
      {phase === GamePhase.BATTLE && selectedHero && opponentHero && (
        <BattleArena 
          playerHero={selectedHero}
          opponentHero={opponentHero}
          onGameOver={handleGameOver}
          onExit={resetGame}
        />
      )}

      {/* --- GAME OVER PHASE --- */}
      {phase === GamePhase.GAME_OVER && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="bg-slate-800 border-2 border-slate-600 p-8 rounded-2xl max-w-lg w-full text-center shadow-2xl transform scale-100 animate-in fade-in zoom-in duration-300">
            <h2 className={`text-6xl font-black mb-2 ${battleResult === 'PLAYER' ? 'text-science-success' : 'text-science-danger'}`}>
              {battleResult === 'PLAYER' ? '胜利' : '失败'}
            </h2>
            <p className="text-xl text-slate-300 mb-8 font-mono">
              {battleResult === 'PLAYER' ? '你的理论得到了证实！' : '回到绘图板重来吧...'}
            </p>
            
            <div className="flex justify-center gap-4">
              <button 
                onClick={resetGame}
                className="bg-white text-slate-900 font-bold px-8 py-3 rounded-full hover:bg-slate-200 transition shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                再玩一次
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
