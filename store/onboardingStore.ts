import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingData } from '@/lib/supabase';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  _hasHydrated: boolean;
  setHasCompletedOnboarding: (status: boolean) => void;
  setHasHydrated: (status: boolean) => void;
}

interface OnboardingStore {
  formData: Partial<OnboardingData>;
  updateFormData: (data: Partial<OnboardingData>) => void;
  clearFormData: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      _hasHydrated: false,
      setHasCompletedOnboarding: (status) => set({ hasCompletedOnboarding: status }),
      setHasHydrated: (status) => set({ _hasHydrated: status }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

export const useOnboardingStoreForm = create<OnboardingStore>((set) => ({
  formData: {},
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  clearFormData: () => set({ formData: {} }),
}));