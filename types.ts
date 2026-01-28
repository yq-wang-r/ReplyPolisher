export enum Persona {
  ADVISOR = 'Advisor',
  BOSS = 'Boss',
  CLIENT = 'Client',
  COLLEAGUE = 'Colleague',
  SENIOR_PEER = 'Senior Peer'
}

// Order for UI display
export const PERSONA_ORDER = [
  Persona.ADVISOR,
  Persona.BOSS,
  Persona.CLIENT,
  Persona.COLLEAGUE,
  Persona.SENIOR_PEER
];

export enum AppLanguage {
  ENGLISH = 'en',
  CHINESE = 'zh'
}

export enum AIProvider {
  GOOGLE = 'Google Gemini',
  OPENAI = 'OpenAI Compatible'
}

export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export const DEFAULT_CONFIG: Record<AIProvider, ProviderConfig> = {
  [AIProvider.GOOGLE]: {
    apiKey: '',
    model: 'gemini-3-flash-preview'
  },
  [AIProvider.OPENAI]: {
    apiKey: '',
    // Defaulting to SiliconFlow as a popular compatible option, but user can change this
    baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
    model: 'deepseek-ai/DeepSeek-V3'
  }
};

export interface PersonaDefinition {
  id: Persona;
  label: string;
  labelZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  promptInstruction: string;
}

export const PERSONA_CONFIG: Record<Persona, PersonaDefinition> = {
  [Persona.ADVISOR]: {
    id: Persona.ADVISOR,
    label: 'Graduate Advisor',
    labelZh: '导师/教授',
    description: 'Sincere, proactive, action-oriented',
    descriptionZh: '真诚、主动、以行动为导向',
    icon: '🎓',
    promptInstruction: 'Role: Student replying to a Professor. Tone: Respectful but proactive. Avoid empty flattery or stiff formalities. If receiving feedback/scolding, focus on "Action Taken" and "fixing it immediately" rather than just apologizing. Sound diligent and sincere.'
  },
  [Persona.BOSS]: {
    id: Persona.BOSS,
    label: 'Boss',
    labelZh: '老板/上司',
    description: 'Professional, concise, results-driven',
    descriptionZh: '专业、简练、结果导向',
    icon: '💼',
    promptInstruction: 'Role: Employee replying to a Boss. Tone: Professional, concise, and outcome-focused. Get straight to the point. Focus on solutions, deadlines, and results. No fluff.'
  },
  [Persona.CLIENT]: {
    id: Persona.CLIENT,
    label: 'Client',
    labelZh: '客户/甲方',
    description: 'Service-oriented, polite, accommodating',
    descriptionZh: '服务导向、客气、周到',
    icon: '🤝',
    promptInstruction: 'Role: Vendor/Service Provider replying to a Client. Tone: Service-oriented, polite, and reassuring. Prioritize their needs and comfort. Use polite but modern business language.'
  },
  [Persona.COLLEAGUE]: {
    id: Persona.COLLEAGUE,
    label: 'Colleague',
    labelZh: '同事',
    description: 'Collaborative, clear, friendly',
    descriptionZh: '协作、清晰、友好',
    icon: '👋',
    promptInstruction: 'Role: Coworker replying to a peer. Tone: Collaborative, clear, and friendly. Keep it casual but professional. "We are in this together" vibe.'
  },
  [Persona.SENIOR_PEER]: {
    id: Persona.SENIOR_PEER,
    label: 'Senior Peer',
    labelZh: '前辈/师兄姐',
    description: 'Respectful, supportive, equal-but-polite',
    descriptionZh: '尊重、得体、不卑不亢',
    icon: '🌟',
    promptInstruction: 'Role: Replying to a senior or experienced peer. Tone: Respectful but authoritative on your own domain. Supportive and professional. Acknowledge their experience without being subservient.'
  }
};

export const TRANSLATIONS = {
  [AppLanguage.ENGLISH]: {
    title: 'ReplyPolisher',
    subtitle: 'Transform your drafts into professional communication with AI.',
    messageDetails: 'Message Details',
    clearAll: 'Clear All',
    contextLabel: 'Incoming Message (Context)',
    contextOptional: 'Optional',
    contextPlaceholder: 'Paste what the other person said here... (optional)',
    draftLabel: 'Your Draft Response',
    draftPlaceholder: "Paste your draft here... (e.g., 'sure, i'll send it over soon')",
    thoughtsLabel: 'Hidden Thoughts / Extra Instructions',
    thoughtsOptional: 'Internal Use Only',
    thoughtsPlaceholder: "e.g., 'I am annoyed but need to be polite', 'Emphasize that I am very busy'",
    selectPersona: 'Select Persona',
    polishButton: 'Polish Text',
    polishing: 'Polishing...',
    proTip: 'Pro tip: Press ⌘ + Enter to polish instantly',
    polishedResult: 'Polished Result',
    personaLabel: 'Persona',
    copy: 'Copy',
    copied: 'Copied',
    provider: 'AI Provider',
    settings: 'Settings',
    generalSettings: 'General Settings',
    defaultPersona: 'Default Persona',
    apiKey: 'API Key',
    baseUrl: 'API URL',
    modelName: 'Model Name',
    save: 'Save',
    cancel: 'Cancel',
    placeholderKey: 'Enter your API Key...',
    placeholderBaseUrl: 'e.g. https://api.openai.com/v1/chat/completions',
    placeholderModel: 'e.g. gpt-4o, deepseek-chat...',
    reset: 'Reset Default',
    configFor: 'Configuration for',
  },
  [AppLanguage.CHINESE]: {
    title: 'ReplyPolisher (回复润色)',
    subtitle: '使用 AI 将您的草稿转化为得体、专业的回复。',
    messageDetails: '消息详情',
    clearAll: '清空内容',
    contextLabel: '收到消息 (上下文)',
    contextOptional: '可选',
    contextPlaceholder: '粘贴对方发来的消息... (可选)',
    draftLabel: '您的回复草稿',
    draftPlaceholder: "粘贴您的草稿... (例如：'好的，我这就去办')",
    thoughtsLabel: '内心潜台词 / 额外指令',
    thoughtsOptional: '仅供参考',
    thoughtsPlaceholder: "例如：'我有点烦，但需要保持礼貌', '强调我很忙'",
    selectPersona: '选择角色口吻',
    polishButton: '开始润色',
    polishing: '正在润色...',
    proTip: '提示：按 Ctrl + Enter 快速生成',
    polishedResult: '润色结果',
    personaLabel: '当前口吻',
    copy: '复制',
    copied: '已复制',
    provider: 'AI 模型服务',
    settings: '设置',
    generalSettings: '通用设置',
    defaultPersona: '默认角色口吻',
    apiKey: 'API Key (密钥)',
    baseUrl: 'API 地址 (Base URL)',
    modelName: '模型名称',
    save: '保存',
    cancel: '取消',
    placeholderKey: '请输入您的 API Key...',
    placeholderBaseUrl: '例如: https://api.openai.com/v1/chat/completions',
    placeholderModel: '例如: gpt-4o, deepseek-chat...',
    reset: '恢复默认',
    configFor: '配置：',
  }
};