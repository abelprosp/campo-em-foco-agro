
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { BellRing } from 'lucide-react';

import { getActivities } from '@/features/activities/api';
import { useAuth } from '@/contexts/AuthContext';

const ALERT_DAYS = 5;

export const useActivityAlerts = () => {
  const { user } = useAuth();
  const { data: activities = [] } = useQuery({
    queryKey: ['activities', user?.id],
    queryFn: getActivities,
    enabled: !!user,
  });
  const [shownAlerts, setShownAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (activities.length > 0) {
      const upcomingActivities = activities.filter(activity => {
        if (!activity.due_date || activity.status === 'Concluída') {
          return false;
        }
        try {
          const daysUntilDue = differenceInDays(parseISO(activity.due_date), new Date());
          return daysUntilDue >= 0 && daysUntilDue <= ALERT_DAYS;
        } catch (error) {
          return false;
        }
      });

      upcomingActivities.forEach(activity => {
        if (!shownAlerts.includes(activity.id)) {
          try {
            const daysUntilDue = differenceInDays(parseISO(activity.due_date!), new Date());
            let message: string;
            if (daysUntilDue === 0) {
              message = `A atividade "${activity.name}" vence hoje.`;
            } else if (daysUntilDue === 1) {
              message = `A atividade "${activity.name}" vence amanhã.`;
            } else {
              message = `A atividade "${activity.name}" vence em ${daysUntilDue} dias.`;
            }
            
            toast(message, {
              icon: <BellRing className="h-4 w-4" />,
            });
  
            setShownAlerts(prev => [...prev, activity.id]);
          } catch(error) {
            // silent fail
          }
        }
      });
    }
  }, [activities, shownAlerts]);
};
