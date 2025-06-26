import { create } from 'zustand';
import { OnboardingData } from '@/lib/supabase';

interface OnboardingStore {
  formData: Partial<OnboardingData>;
  updateFormData: (data: Partial<OnboardingData>) => void;
  clearFormData: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  formData: {},
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  clearFormData: () => set({ formData: {} }),
}));