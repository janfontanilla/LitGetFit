export interface OnboardingStoreState {
  _hasHydrated: boolean;
  hasCompletedOnboarding: boolean;
  currentOnboardingStep: string;
  hasCompletedWelcome: boolean;
  hasCompletedProfile: boolean;
  hasCompletedPermissions: boolean;
  setHasHydrated: () => void;
  completeWelcome: () => void;
  completeProfile: () => void;
  completePermissions: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setCurrentStep: (step: string) => void;
  goToNextStep?: () => void;
  goToPreviousStep?: () => void;
} 