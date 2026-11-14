export type MessageSender = 'user' | 'bot';

export type ResponseCategory =
  | 'greeting'
  | 'identity'
  | 'ai'
  | 'web'
  | 'programming'
  | 'college'
  | 'tanglish'
  | 'math'
  | 'time'
  | 'help'
  | 'custom'
  | 'hybrid-online'
  | 'general';

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
  category?: ResponseCategory;
  isOfflineMatch?: boolean;
  matchScore?: number;
  codeSnippet?: string;
  codeLang?: string;
  liked?: boolean | null;
}

export interface KnowledgeRule {
  id: string;
  triggers: string[];
  response: string;
  category: ResponseCategory;
  isRegex?: boolean;
  regexPattern?: string;
  codeSnippet?: string;
  codeLang?: string;
  isCustom?: boolean;
  exampleQuery?: string;
}

export interface QuizQuestion {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AppSettings {
  isSimulatedOffline: boolean;
  isHybridAllowed: boolean;
  ttsEnabled: boolean;
  ttsVoice: string;
  ttsRate: number;
  soundEffects: boolean;
}
