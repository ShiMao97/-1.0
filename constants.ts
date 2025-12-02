import { Scientist, Field, SkillCard, SkillType, BattleEvent } from './types';

// Helper to add default cooldowns based on cost
// Cost 0/1 = 1000ms, Cost 2 = 2000ms, Cost 3 = 3000ms
const withCD = (card: Omit<SkillCard, 'cooldown'>, modifier = 0): SkillCard => ({
  ...card,
  cooldown: (Math.max(1, card.cost) * 1000) + modifier
});

// Helper to create cards concisely
const c = (id: string, name: string, desc: string, type: SkillType, cost: number, value: number): SkillCard => {
  return withCD({ id, name, description: desc, field: Field.PHYSICS, type, cost, value }); // Field is placeholder, overwritten in context
};

export const FIELD_DISPLAY_NAMES: Record<Field, string> = {
  [Field.PHYSICS]: '物理学',
  [Field.CHEMISTRY]: '化学',
  [Field.BIOLOGY]: '生物学',
  [Field.MATH]: '数学',
  [Field.CS]: '计算机科学',
  [Field.ASTRONOMY]: '天文学', // Kept for legacy compatibility
};

export const FIELD_COLORS: Record<Field, string> = {
  [Field.PHYSICS]: 'text-blue-400 border-blue-500/50 shadow-blue-500/20 bg-blue-950/30',
  [Field.CHEMISTRY]: 'text-green-400 border-green-500/50 shadow-green-500/20 bg-green-950/30',
  [Field.BIOLOGY]: 'text-emerald-400 border-emerald-500/50 shadow-emerald-500/20 bg-emerald-950/30',
  [Field.MATH]: 'text-red-400 border-red-500/50 shadow-red-500/20 bg-red-950/30',
  [Field.ASTRONOMY]: 'text-purple-400 border-purple-500/50 shadow-purple-500/20 bg-purple-950/30',
  [Field.CS]: 'text-yellow-400 border-yellow-500/50 shadow-yellow-500/20 bg-yellow-950/30',
};

export const FIELD_ICONS: Record<Field, string> = {
  [Field.PHYSICS]: '⚛️',
  [Field.CHEMISTRY]: '🧪',
  [Field.BIOLOGY]: '🧬',
  [Field.MATH]: '📐',
  [Field.ASTRONOMY]: '🪐',
  [Field.CS]: '💻',
};

export const BATTLE_EVENTS: BattleEvent[] = [
  { id: 'GRANT', name: '科研拨款', description: '获得额外的资金支持。能量 +2', type: 'POSITIVE' },
  { id: 'MALFUNCTION', name: '设备故障', description: '实验室设备出现问题。能量 -2', type: 'NEGATIVE' },
  { id: 'COFFEE', name: '深夜咖啡', description: '精神焕发。恢复 10 点生命值', type: 'POSITIVE' },
  { id: 'ACCIDENT', name: '实验事故', description: '发生了一次小爆炸。受到 5 点伤害', type: 'NEGATIVE' },
  { id: 'BREAKTHROUGH', name: '理论突破', description: '发现了新的防御机制。获得 15 点护盾', type: 'POSITIVE' },
  { id: 'REVIEW', name: '严苛评审', description: '受到质疑，行动变慢。沉默 3 秒', type: 'NEGATIVE' },
  { id: 'INSIGHT', name: '灵光一闪', description: '找到了捷径。抽 2 张牌', type: 'POSITIVE' },
];

// --- UNIVERSAL CARDS (Available to everyone) ---
export const UNIVERSAL_CARDS: SkillCard[] = [
  c('u_res', '基础研究', '进行简单的研究。', SkillType.BUFF, 0, 1), // +1 Energy
  c('u_def', '实验记录', '记录数据以规避风险。', SkillType.DEFENSE, 1, 6),
  c('u_atk', '学术辩论', '发起基础的攻击。', SkillType.ATTACK, 1, 6),
  c('u_rest', '短暂休息', '恢复少量体力。', SkillType.HEAL, 1, 5),
  c('u_pub', '发表论文', '造成伤害并获得护盾。', SkillType.ATTACK, 2, 10), // Need hybrid logic support, treating as attack for now
  c('u_cof', '再来一杯', '牺牲生命换取能量。', SkillType.BUFF, 0, 2), 
  c('u_deny', '否决', '干扰对手节奏。', SkillType.DEBUFF, 1, 1),
  c('u_focus', '专注', '下一次攻击更强 (抽牌)。', SkillType.BUFF, 1, 0), // Placeholder value
];

// --- FIELD SPECIFIC CARDS (10 per field) ---
// Note: We map generic card definitions and assign the field property dynamically
const defineFieldCards = (field: Field, cards: SkillCard[]) => cards.map(card => ({ ...card, field }));

export const GENERIC_CARDS: Record<Field, SkillCard[]> = {
  [Field.PHYSICS]: defineFieldCards(Field.PHYSICS, [
    c('p_force', '作用力', '施加基础物理打击', SkillType.ATTACK, 1, 8),
    c('p_shield', '力场', '生成偏转护盾', SkillType.DEFENSE, 1, 8),
    c('p_momentum', '动量冲击', '巨大的动能撞击', SkillType.ATTACK, 2, 16),
    c('p_entropy', '熵增', '消耗对手能量', SkillType.DEBUFF, 2, 2),
    c('p_perpetual', '永动理论', '恢复自身能量', SkillType.BUFF, 0, 1),
    c('p_gravity', '重力压制', '高额伤害但高耗能', SkillType.ATTACK, 3, 24),
    c('p_reflect', '镜面反射', '高效的防御手段', SkillType.DEFENSE, 2, 14),
    c('p_laser', '激光束', '精准的能量打击', SkillType.ATTACK, 1, 9),
    c('p_quantum_leap', '量子跃迁', '闪避并回血', SkillType.HEAL, 2, 12),
    c('p_inertia', '惯性', '持续防御', SkillType.DEFENSE, 1, 7),
  ]),
  [Field.CHEMISTRY]: defineFieldCards(Field.CHEMISTRY, [
    c('c_reaction', '放热反应', '燃烧目标', SkillType.ATTACK, 1, 9),
    c('c_bond', '共价键', '强化结构稳定性', SkillType.DEFENSE, 1, 7),
    c('c_acid', '强酸泼洒', '腐蚀性攻击', SkillType.ATTACK, 2, 18),
    c('c_catalyst', '催化剂', '加速反应，回复能量', SkillType.BUFF, 0, 2),
    c('c_inhibitor', '抑制剂', '阻碍对手反应', SkillType.DEBUFF, 1, 1),
    c('c_explosion', '实验室爆炸', '造成巨额伤害', SkillType.ATTACK, 3, 25),
    c('c_buffer', '缓冲液', '中和受到的伤害', SkillType.DEFENSE, 2, 15),
    c('c_extract', '萃取', '汲取对手体力', SkillType.ATTACK, 2, 12),
    c('c_elixir', '试剂调配', '紧急治疗', SkillType.HEAL, 1, 8),
    c('c_gas', '有毒气体', '持续消耗', SkillType.DEBUFF, 2, 2),
  ]),
  [Field.BIOLOGY]: defineFieldCards(Field.BIOLOGY, [
    c('b_claw', '野性一击', '生物本能攻击', SkillType.ATTACK, 1, 7),
    c('b_regen', '细胞再生', '加速新陈代谢', SkillType.HEAL, 1, 6),
    c('b_adapt', '适应性外壳', '进化出防御层', SkillType.DEFENSE, 2, 14),
    c('b_symbiosis', '共生关系', '能量循环', SkillType.BUFF, 1, 2),
    c('b_toxin', '神经毒素', '干扰对手思维', SkillType.DEBUFF, 2, 3),
    c('b_photosyn', '光合作用', '自然恢复', SkillType.HEAL, 2, 15),
    c('b_swarm', '虫群', '多重轻微攻击', SkillType.ATTACK, 2, 16),
    c('b_virus', '病毒植入', '削弱对手', SkillType.DEBUFF, 1, 2),
    c('b_shell', '几丁质甲', '坚固的防御', SkillType.DEFENSE, 1, 9),
    c('b_predator', '捕食者', '强力撕咬', SkillType.ATTACK, 3, 22),
  ]),
  [Field.MATH]: defineFieldCards(Field.MATH, [
    c('m_calc', '精确计算', '无懈可击的逻辑打击', SkillType.ATTACK, 1, 8),
    c('m_geo', '几何护盾', '完美的防御角度', SkillType.DEFENSE, 1, 9),
    c('m_infinity', '趋向无穷', '指数级伤害', SkillType.ATTACK, 3, 25),
    c('m_axiom', '基础公理', '巩固基础', SkillType.BUFF, 0, 1),
    c('m_paradox', '逻辑悖论', '使对手陷入混乱', SkillType.DEBUFF, 2, 2),
    c('m_fractal', '分形防御', '无限递归的护盾', SkillType.DEFENSE, 2, 16),
    c('m_matrix', '矩阵运算', '多维打击', SkillType.ATTACK, 2, 17),
    c('m_prob', '概率操控', '闪避伤害', SkillType.HEAL, 2, 10), // Abstract heal
    c('m_derive', '求导', '削减对手状态', SkillType.DEBUFF, 1, 1),
    c('m_integral', '积分累积', '蓄力一击', SkillType.ATTACK, 1, 10),
  ]),
  [Field.CS]: defineFieldCards(Field.CS, [
    c('cs_compile', '编译错误', '造成精神伤害', SkillType.ATTACK, 1, 8),
    c('cs_firewall', '防火墙', '阻挡入侵', SkillType.DEFENSE, 1, 8),
    c('cs_loop', '死循环', '持续消耗对手', SkillType.ATTACK, 2, 16),
    c('cs_optimize', '代码优化', '提高运行效率', SkillType.BUFF, 0, 2),
    c('cs_ddos', 'DDOS攻击', '阻塞对手资源', SkillType.DEBUFF, 2, 3),
    c('cs_patch', '热修复', '快速回复', SkillType.HEAL, 1, 7),
    c('cs_encrypt', '数据加密', '强力防御', SkillType.DEFENSE, 2, 15),
    c('cs_overflow', '缓冲区溢出', '突破防御的伤害', SkillType.ATTACK, 3, 26),
    c('cs_algorithm', '核心算法', '高效打击', SkillType.ATTACK, 1, 10),
    c('cs_debug', '调试模式', '消除负面状态', SkillType.BUFF, 1, 1),
  ]),
  [Field.ASTRONOMY]: defineFieldCards(Field.ASTRONOMY, [
     c('a_meteor', '陨石撞击', '来自天际的打击', SkillType.ATTACK, 2, 15),
     c('a_orbit', '引力弹弓', '借力防御', SkillType.DEFENSE, 1, 8),
     c('a_nova', '超新星', '毁灭性的爆发', SkillType.ATTACK, 3, 28),
     c('a_void', '虚空虹吸', '吸收能量', SkillType.BUFF, 1, 2),
     c('a_blackhole', '黑洞视界', '吞噬对手能量', SkillType.DEBUFF, 3, 4),
     c('a_star', '恒星光辉', '持续照耀', SkillType.HEAL, 2, 14),
     c('a_nebula', '星云掩护', '模糊身形', SkillType.DEFENSE, 1, 9),
     c('a_pulsar', '脉冲星', '周期性冲击', SkillType.ATTACK, 1, 9),
     c('a_quasar', '类星体', '极高能射线', SkillType.ATTACK, 2, 18),
     c('a_telescope', '深空观测', '洞察先机', SkillType.BUFF, 0, 1),
  ])
};

// --- SCIENTISTS (5 per field, 5 cards each) ---

const createScientist = (
  id: string, name: string, title: string, field: Field, hp: number, quote: string, 
  cards: {id: string, name: string, desc: string, type: SkillType, cost: number, value: number}[]
): Scientist => ({
  id, name, title, field, hp, maxHp: hp, quote,
  deck: cards.map(cData => withCD({
    id: `${id}_${cData.id}`,
    name: cData.name,
    description: cData.desc,
    field,
    type: cData.type,
    cost: cData.cost,
    value: cData.value
  }))
});

export const STARTER_SCIENTISTS: Scientist[] = [
  // --- PHYSICS ---
  createScientist('einstein', '阿尔伯特·爱因斯坦', '相对论大师', Field.PHYSICS, 100, "想象力比知识更重要。", [
    {id: 'relativity', name: '相对论', desc: '时间膨胀造成大量伤害', type: SkillType.ATTACK, cost: 3, value: 25},
    {id: 'emc2', name: 'E=mc²', desc: '质能转换爆发', type: SkillType.ATTACK, cost: 2, value: 18},
    {id: 'spacetime', name: '时空弯曲', desc: '扭曲空间以防御', type: SkillType.DEFENSE, cost: 2, value: 15},
    {id: 'photoelectric', name: '光电效应', desc: '粒子流打击', type: SkillType.ATTACK, cost: 1, value: 9},
    {id: 'godsdice', name: '上帝不掷骰子', desc: '恢复秩序', type: SkillType.BUFF, cost: 0, value: 2},
  ]),
  createScientist('newton', '艾萨克·牛顿', '经典力学奠基人', Field.PHYSICS, 105, "如果我看得更远，是因为我站在巨人的肩膀上。", [
    {id: 'gravity', name: '万有引力', desc: '不可抗拒的重压', type: SkillType.ATTACK, cost: 2, value: 16},
    {id: 'calculus', name: '流数法', desc: '精确计算轨迹', type: SkillType.BUFF, cost: 1, value: 3}, // Energy
    {id: 'prism', name: '光学棱镜', desc: '分散伤害', type: SkillType.DEFENSE, cost: 1, value: 8},
    {id: 'action', name: '反作用力', desc: '反弹伤害', type: SkillType.ATTACK, cost: 1, value: 10},
    {id: 'apple', name: '掉落的苹果', desc: '灵感回复', type: SkillType.HEAL, cost: 1, value: 8},
  ]),
  createScientist('bohr', '尼尔斯·玻尔', '量子力学教父', Field.PHYSICS, 95, "任何不为量子理论感到震惊的人，都不理解它。", [
    {id: 'model', name: '原子模型', desc: '构建稳定防御', type: SkillType.DEFENSE, cost: 2, value: 16},
    {id: 'jump', name: '量子跃迁', desc: '突然的能量释放', type: SkillType.ATTACK, cost: 2, value: 17},
    {id: 'complement', name: '互补原理', desc: '攻守兼备', type: SkillType.BUFF, cost: 1, value: 2},
    {id: 'copenhagen', name: '哥本哈根诠释', desc: '干扰观测者', type: SkillType.DEBUFF, cost: 2, value: 3},
    {id: 'electron', name: '电子云', desc: '难以捉摸的攻击', type: SkillType.ATTACK, cost: 1, value: 8},
  ]),
  createScientist('feynman', '理查德·费曼', '物理顽童', Field.PHYSICS, 100, "我以为我能理解，但我不能。", [
    {id: 'diagram', name: '费曼图', desc: '可视化的粒子交互', type: SkillType.ATTACK, cost: 2, value: 15},
    {id: 'qed', name: 'Q.E.D.', desc: '量子电动力学打击', type: SkillType.ATTACK, cost: 3, value: 24},
    {id: 'bongo', name: '邦戈鼓节奏', desc: '扰乱对手', type: SkillType.DEBUFF, cost: 1, value: 2},
    {id: 'nano', name: '底部空间', desc: '微观操作', type: SkillType.BUFF, cost: 0, value: 1},
    {id: 'path', name: '路径积分', desc: '计算所有可能性', type: SkillType.DEFENSE, cost: 1, value: 10},
  ]),
  createScientist('maxwell', '詹姆斯·麦克斯韦', '电磁学集大成者', Field.PHYSICS, 98, "数学是科学的语言。", [
    {id: 'equations', name: '麦克斯韦方程组', desc: '完美的物理定律', type: SkillType.ATTACK, cost: 3, value: 26},
    {id: 'demon', name: '麦克斯韦妖', desc: '控制熵减', type: SkillType.HEAL, cost: 2, value: 14},
    {id: 'field', name: '电磁场', desc: '全方位护盾', type: SkillType.DEFENSE, cost: 2, value: 15},
    {id: 'light', name: '光速不变', desc: '极速打击', type: SkillType.ATTACK, cost: 1, value: 9},
    {id: 'wave', name: '电磁波', desc: '持续干扰', type: SkillType.DEBUFF, cost: 1, value: 2},
  ]),

  // --- CHEMISTRY ---
  createScientist('curie', '玛丽·居里', '放射性先驱', Field.CHEMISTRY, 90, "生活中没有什么可怕的东西，只有需要理解的东西。", [
    {id: 'radium', name: '镭射线', desc: '穿透性辐射伤害', type: SkillType.ATTACK, cost: 2, value: 20},
    {id: 'polonium', name: '钋衰变', desc: '剧毒攻击', type: SkillType.ATTACK, cost: 1, value: 12},
    {id: 'xray', name: '便携X光', desc: '治疗战地伤势', type: SkillType.HEAL, cost: 2, value: 15},
    {id: 'nobel2', name: '双诺贝尔奖', desc: '权威压制', type: SkillType.BUFF, cost: 1, value: 2},
    {id: 'lab', name: '沥青铀矿', desc: '提炼能量', type: SkillType.BUFF, cost: 0, value: 2},
  ]),
  createScientist('mendeleev', '德米特里·门捷列夫', '元素周期表之父', Field.CHEMISTRY, 105, "科学从测量开始。", [
    {id: 'table', name: '周期表', desc: '元素的秩序', type: SkillType.DEFENSE, cost: 2, value: 18},
    {id: 'predict', name: '元素预测', desc: '精准的预判', type: SkillType.BUFF, cost: 0, value: 2},
    {id: 'alkali', name: '碱金属', desc: '剧烈反应', type: SkillType.ATTACK, cost: 1, value: 10},
    {id: 'period', name: '周期律', desc: '循环打击', type: SkillType.ATTACK, cost: 2, value: 15},
    {id: 'dream', name: '化学之梦', desc: '灵感恢复', type: SkillType.HEAL, cost: 1, value: 7},
  ]),
  createScientist('lavoisier', '安托万·拉瓦锡', '现代化学之父', Field.CHEMISTRY, 95, "物质不灭。", [
    {id: 'conserv', name: '质量守恒', desc: '转化受到的伤害', type: SkillType.DEFENSE, cost: 1, value: 10},
    {id: 'oxygen', name: '氧气助燃', desc: '强化下一次攻击', type: SkillType.BUFF, cost: 1, value: 3},
    {id: 'nomenclature', name: '化学命名', desc: '规范化攻击', type: SkillType.ATTACK, cost: 1, value: 9},
    {id: 'element', name: '元素定义', desc: '基础打击', type: SkillType.ATTACK, cost: 2, value: 16},
    {id: 'guillotine', name: '悲剧终结', desc: '与对手同归于尽(高伤自损)', type: SkillType.ATTACK, cost: 3, value: 30}, // Thematic
  ]),
  createScientist('nobel', '阿尔弗雷德·诺贝尔', '炸药发明家', Field.CHEMISTRY, 92, "我的理想是为人类造福。", [
    {id: 'dynamite', name: '达纳炸药', desc: '巨大的物理爆破', type: SkillType.ATTACK, cost: 3, value: 28},
    {id: 'prize', name: '和平奖', desc: '休战恢复', type: SkillType.HEAL, cost: 2, value: 16},
    {id: 'detonator', name: '雷管', desc: '引爆', type: SkillType.ATTACK, cost: 1, value: 12},
    {id: 'patent', name: '专利持有', desc: '资源积累', type: SkillType.BUFF, cost: 0, value: 1},
    {id: 'safety', name: '安全引信', desc: '防止自伤', type: SkillType.DEFENSE, cost: 1, value: 8},
  ]),
  createScientist('pauling', '莱纳斯·鲍林', '化学键大师', Field.CHEMISTRY, 98, "消除战争的唯一方法是消除其原因。", [
    {id: 'vitamin', name: '维C疗法', desc: '强效免疫', type: SkillType.HEAL, cost: 1, value: 10},
    {id: 'hybrid', name: '杂化轨道', desc: '灵活多变的攻击', type: SkillType.ATTACK, cost: 2, value: 15},
    {id: 'electroneg', name: '电负性', desc: '吸引对手能量', type: SkillType.DEBUFF, cost: 2, value: 3},
    {id: 'alpha', name: 'α螺旋', desc: '稳定的结构', type: SkillType.DEFENSE, cost: 2, value: 14},
    {id: 'peace', name: '反核示威', desc: '阻止攻击', type: SkillType.DEFENSE, cost: 1, value: 12},
  ]),

  // --- BIOLOGY ---
  createScientist('darwin', '查尔斯·达尔文', '进化论之父', Field.BIOLOGY, 110, "存活下来的不是最强壮的物种，而是最能适应变化的物种。", [
    {id: 'evolution', name: '自然选择', desc: '优胜劣汰的一击', type: SkillType.ATTACK, cost: 2, value: 16},
    {id: 'survival', name: '适者生存', desc: '大幅回复生命', type: SkillType.HEAL, cost: 3, value: 20},
    {id: 'galapagos', name: '雀鸟之喙', desc: '针对弱点的啄击', type: SkillType.ATTACK, cost: 1, value: 10},
    {id: 'origin', name: '物种起源', desc: '生命爆发', type: SkillType.BUFF, cost: 1, value: 3},
    {id: 'adaption', name: '环境适应', desc: '减少受到的伤害', type: SkillType.DEFENSE, cost: 1, value: 9},
  ]),
  createScientist('mendel', '格雷戈尔·孟德尔', '遗传学之父', Field.BIOLOGY, 100, "我的时代终将到来。", [
    {id: 'peas', name: '豌豆杂交', desc: '培育优良性状', type: SkillType.BUFF, cost: 1, value: 2},
    {id: 'dominant', name: '显性基因', desc: '强力显现', type: SkillType.ATTACK, cost: 2, value: 18},
    {id: 'recessive', name: '隐性基因', desc: '潜伏的威胁', type: SkillType.DEBUFF, cost: 1, value: 2},
    {id: 'segregation', name: '分离定律', desc: '拆解对手防御', type: SkillType.ATTACK, cost: 2, value: 14},
    {id: 'garden', name: '修道院花园', desc: '宁静的恢复', type: SkillType.HEAL, cost: 1, value: 8},
  ]),
  createScientist('pasteur', '路易·巴斯德', '微生物学之父', Field.BIOLOGY, 95, "机遇只偏爱有准备的头脑。", [
    {id: 'pasteurize', name: '巴氏消毒', desc: '清除负面状态', type: SkillType.HEAL, cost: 1, value: 10},
    {id: 'vaccine', name: '狂犬疫苗', desc: '获得长期免疫', type: SkillType.DEFENSE, cost: 3, value: 25},
    {id: 'ferment', name: '发酵工程', desc: '产生能量', type: SkillType.BUFF, cost: 0, value: 2},
    {id: 'germ', name: '病菌理论', desc: '揭示弱点', type: SkillType.DEBUFF, cost: 1, value: 2},
    {id: 'swan', name: '鹅颈瓶', desc: '阻隔外界侵害', type: SkillType.DEFENSE, cost: 1, value: 8},
  ]),
  createScientist('fleming', '亚历山大·弗莱明', '青霉素发现者', Field.BIOLOGY, 92, "有时由于疏忽也会发现意想不到的事。", [
    {id: 'penicillin', name: '青霉素', desc: '强效抗生素治疗', type: SkillType.HEAL, cost: 2, value: 18},
    {id: 'mold', name: '霉菌培养', desc: '意外的收获', type: SkillType.BUFF, cost: 0, value: 1},
    {id: 'culture', name: '培养皿', desc: '准备药剂', type: SkillType.BUFF, cost: 1, value: 2},
    {id: 'antibio', name: '抗菌屏障', desc: '防御生物攻击', type: SkillType.DEFENSE, cost: 2, value: 12},
    {id: 'save', name: '拯救生命', desc: '紧急治疗', type: SkillType.HEAL, cost: 1, value: 8},
  ]),
  createScientist('franklin', '罗莎琳德·富兰克林', 'DNA光女', Field.BIOLOGY, 98, "科学和日常生活不能也不应被分开。", [
    {id: 'photo51', name: '照片51号', desc: '揭示双螺旋结构', type: SkillType.BUFF, cost: 2, value: 4}, // High Energy
    {id: 'xray_cryst', name: 'X射线晶体', desc: '高精度透视打击', type: SkillType.ATTACK, cost: 2, value: 16},
    {id: 'structure', name: '分子结构', desc: '稳固防御', type: SkillType.DEFENSE, cost: 1, value: 9},
    {id: 'virus_rna', name: '病毒RNA', desc: '深入研究', type: SkillType.ATTACK, cost: 1, value: 10},
    {id: 'truth', name: '被遗忘的真相', desc: '精神反击', type: SkillType.ATTACK, cost: 2, value: 14},
  ]),

  // --- MATH ---
  createScientist('euler', '莱昂哈德·欧拉', '数学之王', Field.MATH, 100, "因为上帝存在，所以数学是相容的。", [
    {id: 'identity', name: '欧拉恒等式', desc: '最美的公式 (e^iπ+1=0)', type: SkillType.ATTACK, cost: 3, value: 30},
    {id: 'graph', name: '七桥问题', desc: '路径规划，无法逃脱', type: SkillType.DEBUFF, cost: 2, value: 3},
    {id: 'poly', name: '多面体公式', desc: 'V-E+F=2 护盾', type: SkillType.DEFENSE, cost: 1, value: 10},
    {id: 'function', name: '函数定义', desc: 'f(x) 的精准打击', type: SkillType.ATTACK, cost: 1, value: 8},
    {id: 'vision', name: '心算大师', desc: '盲眼亦能计算', type: SkillType.BUFF, cost: 0, value: 2},
  ]),
  createScientist('gauss', '卡尔·弗里德里希·高斯', '数学王子', Field.MATH, 102, "数学是科学的皇后。", [
    {id: 'dist', name: '正态分布', desc: '均衡的攻防', type: SkillType.DEFENSE, cost: 2, value: 14},
    {id: 'sum', name: '级数求和', desc: '快速积累能量', type: SkillType.BUFF, cost: 1, value: 3},
    {id: 'flux', name: '高斯通量', desc: '穿透性场', type: SkillType.ATTACK, cost: 2, value: 16},
    {id: 'modular', name: '同余算术', desc: '周期性伤害', type: SkillType.ATTACK, cost: 1, value: 9},
    {id: 'magnet', name: '磁感应', desc: '控制对手', type: SkillType.DEBUFF, cost: 1, value: 2},
  ]),
  createScientist('riemann', '伯恩哈德·黎曼', '几何大师', Field.MATH, 96, "几何基础假说。", [
    {id: 'zeta', name: '黎曼猜想', desc: '素数的分布谜题', type: SkillType.ATTACK, cost: 3, value: 28},
    {id: 'manifold', name: '流形', desc: '多维空间防御', type: SkillType.DEFENSE, cost: 2, value: 16},
    {id: 'metric', name: '度量张量', desc: '扭曲距离', type: SkillType.DEBUFF, cost: 1, value: 2},
    {id: 'surface', name: '黎曼曲面', desc: '复杂的拓扑结构', type: SkillType.DEFENSE, cost: 1, value: 8},
    {id: 'prime', name: '素数计数', desc: '无尽的序列', type: SkillType.ATTACK, cost: 1, value: 10},
  ]),
  createScientist('pythagoras', '毕达哥拉斯', '万物皆数', Field.MATH, 95, "万物皆数。", [
    {id: 'theorem', name: '勾股定理', desc: 'A²+B²=C² 的完美一击', type: SkillType.ATTACK, cost: 2, value: 18},
    {id: 'ratio', name: '黄金分割', desc: '美的治愈', type: SkillType.HEAL, cost: 2, value: 15},
    {id: 'harmony', name: '天体音乐', desc: '和谐共振', type: SkillType.BUFF, cost: 1, value: 2},
    {id: 'irrational', name: '无理数之惧', desc: '造成精神混乱', type: SkillType.DEBUFF, cost: 2, value: 2},
    {id: 'triangle', name: '三角阵', desc: '稳固阵型', type: SkillType.DEFENSE, cost: 1, value: 8},
  ]),
  createScientist('noether', '艾米·诺特', '代数女皇', Field.MATH, 98, "我的方法其实是思维和算术的方法。", [
    {id: 'symmetry', name: '诺特定理', desc: '对称性意味着守恒', type: SkillType.BUFF, cost: 2, value: 4}, // Very strong energy
    {id: 'ring', name: '诺特环', desc: '抽象代数护盾', type: SkillType.DEFENSE, cost: 1, value: 10},
    {id: 'invariant', name: '不变量', desc: '无视防御的伤害', type: SkillType.ATTACK, cost: 2, value: 15},
    {id: 'abstract', name: '抽象化', desc: '简化战场', type: SkillType.DEBUFF, cost: 1, value: 1},
    {id: 'ideal', name: '理想', desc: '追求完美', type: SkillType.HEAL, cost: 1, value: 8},
  ]),

  // --- CS ---
  createScientist('turing', '阿兰·图灵', '计算机之父', Field.CS, 100, "机器能思考吗？", [
    {id: 'machine', name: '图灵机', desc: '万能计算打击', type: SkillType.ATTACK, cost: 2, value: 18},
    {id: 'enigma', name: '破解Enigma', desc: '洞悉对手弱点', type: SkillType.DEBUFF, cost: 2, value: 4},
    {id: 'test', name: '图灵测试', desc: '分辨真伪', type: SkillType.DEFENSE, cost: 1, value: 9},
    {id: 'halt', name: '停机问题', desc: '强制停止对手行动', type: SkillType.DEBUFF, cost: 3, value: 5}, // Heavy drain
    {id: 'tape', name: '无限纸带', desc: '资源读取', type: SkillType.BUFF, cost: 0, value: 1},
  ]),
  createScientist('lovelace', '阿达·洛夫莱斯', '第一位程序员', Field.CS, 95, "那台分析机编织代数模式，就像提花织机编织花叶一样。", [
    {id: 'algorithm1', name: '第一算法', desc: '伯努利数计算', type: SkillType.ATTACK, cost: 2, value: 16},
    {id: 'note_g', name: '注记G', desc: '编程的预言', type: SkillType.BUFF, cost: 1, value: 3},
    {id: 'loop', name: '循环指令', desc: '重复攻击', type: SkillType.ATTACK, cost: 1, value: 8},
    {id: 'poet', name: '数字诗人', desc: '优雅的代码', type: SkillType.HEAL, cost: 2, value: 12},
    {id: 'engine', name: '分析机', desc: '启动引擎', type: SkillType.BUFF, cost: 0, value: 2},
  ]),
  createScientist('von_neumann', '约翰·冯·诺伊曼', '现代计算机之父', Field.CS, 105, "若人们不相信数学简单，只因他们不懂人生之苦。", [
    {id: 'arch', name: '冯·诺伊曼架构', desc: '存储与计算并行', type: SkillType.BUFF, cost: 2, value: 3},
    {id: 'game', name: '博弈论', desc: '最小最大化策略', type: SkillType.DEFENSE, cost: 2, value: 15},
    {id: 'merge', name: '归并排序', desc: '有序的打击', type: SkillType.ATTACK, cost: 1, value: 10},
    {id: 'automata', name: '细胞自动机', desc: '自我复制的攻击', type: SkillType.ATTACK, cost: 3, value: 22},
    {id: 'implode', name: '内爆计算', desc: '核心算力爆发', type: SkillType.ATTACK, cost: 2, value: 18},
  ]),
  createScientist('knuth', '唐纳德·克努特', '算法分析之父', Field.CS, 98, "过早优化是万恶之源。", [
    {id: 'taocp', name: '计算机程序设计艺术', desc: '厚重的知识打击', type: SkillType.ATTACK, cost: 3, value: 25},
    {id: 'tex', name: 'TeX排版', desc: '完美的格式化防御', type: SkillType.DEFENSE, cost: 1, value: 10},
    {id: 'big_o', name: '大O符号', desc: '复杂度分析', type: SkillType.DEBUFF, cost: 1, value: 2},
    {id: 'tree', name: '二叉树', desc: '分支选择', type: SkillType.BUFF, cost: 0, value: 2},
    {id: 'surreal', name: '超现实数', desc: '难以理解的数值', type: SkillType.HEAL, cost: 2, value: 14},
  ]),
  createScientist('hopper', '格蕾丝·赫柏', 'COBOL之母', Field.CS, 96, "请求原谅比请求许可更容易。", [
    {id: 'compiler', name: 'A-0编译器', desc: '转化语言为行动', type: SkillType.BUFF, cost: 1, value: 2},
    {id: 'moth', name: '第一只Bug', desc: '发现并排除故障', type: SkillType.HEAL, cost: 1, value: 10},
    {id: 'cobol', name: '通用语言', desc: '广泛的攻击', type: SkillType.ATTACK, cost: 2, value: 15},
    {id: 'nanosec', name: '纳秒电线', desc: '极速响应', type: SkillType.ATTACK, cost: 1, value: 9},
    {id: 'navy', name: '海军准将', desc: '战术指挥', type: SkillType.DEFENSE, cost: 2, value: 14},
  ]),
];
