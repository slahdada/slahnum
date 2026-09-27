import { Task } from '../types';

export interface DayTaskStat {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Lun 21", "Dim 27"
  dayName: string; // "Lundi", etc.
  fullDate: string;
  completed: number;
}

export function getLast7DaysTaskStats(tasks: Task[]): {
  data: DayTaskStat[];
  totalLast7Days: number;
  dailyAverage: number;
  bestDay: { dayLabel: string; count: number } | null;
} {
  const result: DayTaskStat[] = [];
  const now = new Date();

  // Generate the last 7 days including today (from day -6 to day 0)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];

    // Day short name in French: e.g. "Lun 21"
    const dayOfWeek = d.toLocaleDateString('fr-FR', { weekday: 'short' });
    const dayNum = d.getDate();
    const dayLabel = i === 0 ? 'Aujourd\'hui' : `${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1, 3)} ${dayNum}`;
    const dayName = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
    const fullDate = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Count tasks that were completed on this date
    // We check task.completedAt starting with dateKey,
    // or if completed && !completedAt && isToday and i === 0 (fallback)
    const count = tasks.filter(t => {
      if (!t.completed) return false;
      if (t.completedAt) {
        return t.completedAt.startsWith(dateKey);
      }
      // Fallback for legacy tasks marked completed without completedAt
      if (i === 0 && t.isToday) return true;
      return false;
    }).length;

    result.push({
      date: dateKey,
      dayLabel,
      dayName,
      fullDate,
      completed: count
    });
  }

  const totalLast7Days = result.reduce((acc, curr) => acc + curr.completed, 0);
  const dailyAverage = Math.round((totalLast7Days / 7) * 10) / 10;

  let bestDay: { dayLabel: string; count: number } | null = null;
  for (const item of result) {
    if (!bestDay || item.completed > bestDay.count) {
      bestDay = { dayLabel: item.dayLabel, count: item.completed };
    }
  }

  return {
    data: result,
    totalLast7Days,
    dailyAverage,
    bestDay
  };
}
