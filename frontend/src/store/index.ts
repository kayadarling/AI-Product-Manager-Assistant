import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRDDocument, APIConfig } from '@/types';

interface AppState {
  prd: PRDDocument | null;
  prdMarkdown: string | null;
  flowchartCode: string | null;
  isLoading: boolean;
  loadingText: string;
  error: string | null;
  apiConfig: APIConfig;
  setPRD: (prd: PRDDocument | null) => void;
  setPRDMarkdown: (markdown: string | null) => void;
  setFlowchartCode: (code: string | null) => void;
  setLoading: (loading: boolean, text?: string) => void;
  setError: (error: string | null) => void;
  setApiConfig: (config: Partial<APIConfig>) => void;
  reset: () => void;
}

const initialState = {
  prd: null,
  prdMarkdown: null,
  flowchartCode: null,
  isLoading: false,
  loadingText: '处理中...',
  error: null,
  apiConfig: {
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      setPRD: (prd) => set({ prd }),
      setPRDMarkdown: (prdMarkdown) => set({ prdMarkdown }),
      setFlowchartCode: (flowchartCode) => set({ flowchartCode }),
      setLoading: (isLoading, loadingText = '处理中...') => set({ isLoading, loadingText }),
      setError: (error) => set({ error }),
      setApiConfig: (config) =>
        set((state) => ({
          apiConfig: { ...state.apiConfig, ...config },
        })),
      reset: () => set(initialState),
    }),
    {
      name: 'ai-pm-storage',
      partialize: (state) => ({ apiConfig: state.apiConfig }),
    }
  )
);
