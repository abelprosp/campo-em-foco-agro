import { useQuery } from '@tanstack/react-query';
import { isFuture } from 'date-fns';
import { getProfile } from '@/features/profile/api';
import { useAuth } from '@/contexts/AuthContext';

export const useTrialStatus = () => {
  const { user } = useAuth();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
  });

  if (!profile || !profile.user_usage) {
    return {
      isLoading,
      isPro: false,
      isTrialActive: false,
      trialEndDate: null,
      daysRemaining: 0,
    };
  }

  const { plan_type, trial_end_date } = profile.user_usage;
  const isPro = plan_type === 'pro';
  const isTrialActive = !isPro && trial_end_date && isFuture(new Date(trial_end_date));
  
  let daysRemaining = 0;
  if (trial_end_date && !isPro) {
    const endDate = new Date(trial_end_date);
    const now = new Date();
    daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  return {
    isLoading,
    isPro,
    isTrialActive,
    trialEndDate: trial_end_date,
    daysRemaining,
  };
}; 