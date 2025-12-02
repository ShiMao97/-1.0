export enum Field {
  PHYSICS = 'Physics',
  CHEMISTRY = 'Chemistry',
  BIOLOGY = 'Biology',
  MATH = 'Mathematics',
  ASTRONOMY = 'Astronomy',
  CS = 'Computer Science'
}

export enum SkillType {
  ATTACK = 'ATTACK',
  DEFENSE = 'DEFENSE',
  HEAL = 'HEAL',
  BUFF = 'BUFF',
  DEBUFF = 'DEBUFF'
}

export interface SkillCard {
  id: string;
  name: string;
  description: string;
  field: Field;
  type: SkillType;
  cost: number;
  value: number;
  cooldown: number; // In milliseconds
}

export interface Scientist {
  id: string;
  name: string;
  title: string;
  field: Field;
  hp: number;
  maxHp: number;
  quote: string;
  imageUrl?: string;
  deck: SkillCard[]; // Initial unique cards
}

export enum GamePhase {
  MENU = 'MENU',
  LOADING_GENERATE = 'LOADING_GENERATE',
  BATTLE = 'BATTLE',
  GAME_OVER = 'GAME_OVER'
}

export interface LogEntry {
  timestamp: number;
  speaker: 'System' | 'Player' | 'Opponent';
  message: string;
  damage?: number;
  heal?: number;
  block?: number;
}

export interface BattleState {
  hp: number;
  maxHp: number;
  shield: number;
  energy: number;
  maxEnergy: number;
  hand: SkillCard[];
  deck: SkillCard[];
  discard: SkillCard[];
  isCasting: boolean; // If true, cannot play cards (Global Cooldown)
  castEndTime: number; // Timestamp when casting finishes
}

export interface BattleEvent {
  id: string;
  name: string;
  description: string;
  type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}
