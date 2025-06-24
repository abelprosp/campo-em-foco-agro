
import React, { useState, useMemo } from 'react';
import type { DayContentProps } from 'react-day-picker';
import { isSameDay, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Activity } from './api';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ActivityCalendarProps {
  activities: Activity[];
}

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Pendente: "destructive",
  'Em andamento': "secondary",
  Concluída: "default",
};

export const ActivityCalendar = ({ activities }: ActivityCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const activityDates = useMemo(() => {
    return activities
      .map(act => act.due_date ? parseISO(act.due_date) : null)
      .filter((d): d is Date => d !== null);
  }, [activities]);

  const dailyActivities = useMemo(() => {
    if (!date) return [];
    return activities.filter(activity =>
      activity.due_date && isSameDay(parseISO(activity.due_date), date)
    );
  }, [activities, date]);

  function DayContentWithDot(props: DayContentProps) {
    const hasActivity = activityDates.some(d => isSameDay(d, props.date));
    return (
      <span className="relative flex h-full w-full items-center justify-center">
        {format(props.date, 'd')}
        {hasActivity && <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-primary" />}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
        locale={ptBR}
        components={{ DayContent: DayContentWithDot }}
      />
      {date && (
        <Card>
          <CardHeader>
            <CardTitle>Atividades para {format(date, 'PPP', { locale: ptBR })}</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyActivities.length > 0 ? (
              <ul className="space-y-3">
                {dailyActivities.map(activity => (
                  <li key={activity.id} className="flex justify-between items-center text-sm">
                    <span className='flex-1 pr-2'>{activity.name}</span>
                    <Badge variant={statusVariant[activity.status] || 'outline'}>{activity.status}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma atividade para este dia.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
