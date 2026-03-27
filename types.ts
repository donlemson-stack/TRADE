
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: number;
  sources?: Array<{ title: string; uri: string }>;
}

export interface TradeTopic {
  title: string;
  description: string;
  icon: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Professional' | 'Executive';
  thumbnail: string;
  modules: string[];
  isFree?: boolean;
}
