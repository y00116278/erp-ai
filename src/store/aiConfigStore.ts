import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ModelConfig {
  apiKey: string;
  modelName: string;
  baseUrl: string;
}

export interface AIConfig {
  chat: ModelConfig;
  voice: ModelConfig;
}

interface AIConfigStore {
  chat: ModelConfig;
  voice: ModelConfig;
  setChatConfig: (config: Partial<ModelConfig>) => void;
  setVoiceConfig: (config: Partial<ModelConfig>) => void;
  getChatConfig: () => ModelConfig;
  getVoiceConfig: () => ModelConfig;
}

const defaultChatConfig: ModelConfig = {
  apiKey: process.env.NEXT_PUBLIC_LLM_API_KEY || '',
  modelName: process.env.NEXT_PUBLIC_LLM_MODEL_NAME || 'gpt-4o-mini',
  baseUrl: process.env.NEXT_PUBLIC_LLM_BASE_URL || 'https://api.openai.com/v1',
};

const defaultVoiceConfig: ModelConfig = {
  apiKey: '',
  modelName: 'whisper-1',
  baseUrl: 'https://api.openai.com/v1',
};

export const useAIConfigStore = create<AIConfigStore>()(
  persist(
    (set, get) => ({
      chat: defaultChatConfig,
      voice: defaultVoiceConfig,

      setChatConfig: (config) =>
        set((state) => ({
          chat: { ...state.chat, ...config },
        })),

      setVoiceConfig: (config) =>
        set((state) => ({
          voice: { ...state.voice, ...config },
        })),

      getChatConfig: () => get().chat,
      getVoiceConfig: () => get().voice,
    }),
    {
      name: 'erp-ai-config',
    }
  )
);
