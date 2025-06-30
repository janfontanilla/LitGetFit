import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingData } from '@/lib/supabase';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  _hasHydrated: boolean;
  currentOnboardingStep: string;
  hasCompletedWelcome: boolean;
  hasCompletedProfile: boolean;
  hasCompletedPermissions: boolean;
  setHasCompletedOnboarding: (status: boolean) => void;
  setHasHydrated: () => void;
  completeWelcome: () => void;
  completeProfile: () => void;
  completePermissions: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setCurrentStep: (step: string) => void;
}

interface OnboardingStore {
  formData: Partial<OnboardingData>;
  updateFormData: (data: Partial<OnboardingData>) => void;
  clearFormData: () => void;
}

export const useOnboardingStore = create(
  persist(
    (set, get) => ({
      // Hydration state
      _hasHydrated: false,
      // Overall onboarding completion
      hasCompletedOnboarding: false,
      // Current step tracking
      currentOnboardingStep: 'welcome', // 'welcome' | 'profile' | 'permissions' | 'complete'
      // Individual step completion flags
      hasCompletedWelcome: false,
      hasCompletedProfile: false,
      hasCompletedPermissions: false,
      // Actions
      setHasHydrated: () => set({ _hasHydrated: true }),
      completeWelcome: () => {
        set({ 
          hasCompletedWelcome: true,
          currentOnboardingStep: 'profile'
        });
      },
      completeProfile: () => {
        set({ 
          hasCompletedProfile: true,
          currentOnboardingStep: 'permissions'
        });
      },
      completePermissions: () => {
        set({ 
          hasCompletedPermissions: true,
          currentOnboardingStep: 'complete'
        });
      },
      completeOnboarding: () => {
        set({ 
          hasCompletedOnboarding: true,
          hasCompletedWelcome: true,
          hasCompletedProfile: true,
          hasCompletedPermissions: true,
          currentOnboardingStep: 'complete'
        });
      },
      // Reset onboarding (for testing)
      resetOnboarding: () => {
        set({
          hasCompletedOnboarding: false,
          hasCompletedWelcome: false,
          hasCompletedProfile: false,
          hasCompletedPermissions: false,
          currentOnboardingStep: 'welcome'
        });
      },
      // Skip to specific step
      setCurrentStep: (step: string) => {
        set({ currentOnboardingStep: step });
      }
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state && typeof (state as any).setHasHydrated === 'function') {
          (state as any).setHasHydrated();
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