import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  TooltipProps
} from 'recharts';
import { TrendingUp, BarChart2, Activity, Calendar } from 'lucide-react';
import { Task, ThemeMode } from '../types';
import { getLast7DaysTaskStats, DayTaskStat } from '../utils/taskStats';

interface TaskActivityChartProps {
  tasks: Task[];
  theme: ThemeMode;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: DayTaskStat;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const count = payload[0].value;
    return (
      <div className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-700/80 shadow-xl rounded-lg p-2.5 text-xs backdrop-blur-md">
        <p className="font-semibold text-zinc-900 dark:text-white capitalize">{data.fullDate}</p>
        <div className="flex items-center gap-2 mt-1.5 text-zinc-600 dark:text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span>Tâches terminées :</span>
          <span className="font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400 text-sm">
            {count}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const TaskActivityChart: React.FC<TaskActivityChartProps> = ({ tasks, theme }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const stats = useMemo(() => getLast7DaysTaskStats(tasks), [tasks]);
  const isDark = theme === 'dark';

  const gridStroke = isDark ? '#27272a' : '#e4e4e7';
  const axisColor = isDark ? '#71717a' : '#a1a1aa';

  return (
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/90 rounded-xl p-5 flex flex-col shadow-sm dark:shadow-none transition-colors duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">
              Activité des Tâches (7 derniers jours)
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Évolution du nombre de tâches accomplies jour par jour
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950/80 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-medium ${
                chartType === 'area'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Affichage en courbe"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Courbe</span>
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-medium ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Affichage en barres"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Barres</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 pt-1">
        <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-2.5 sm:p-3">
          <span className="text-[11px] text-zinc-500 block truncate">Total 7 jours</span>
          <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
            {stats.totalLast7Days}
          </span>
          <span className="text-[10px] text-zinc-500 block truncate">tâches finalisées</span>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-2.5 sm:p-3">
          <span className="text-[11px] text-zinc-500 block truncate">Moyenne quotidienne</span>
          <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {stats.dailyAverage}
          </span>
          <span className="text-[10px] text-zinc-500 block truncate">tâches / jour</span>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-2.5 sm:p-3">
          <span className="text-[11px] text-zinc-500 block truncate">Pic d'activité</span>
          <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 truncate block">
            {stats.bestDay ? `${stats.bestDay.count}` : '0'}
          </span>
          <span className="text-[10px] text-zinc-500 block truncate">
            {stats.bestDay ? stats.bestDay.dayLabel : 'Aucun'}
          </span>
        </div>
      </div>

      {/* Recharts Component Container */}
      <div className="w-full h-56 sm:h-64 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart
              data={stats.data}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="taskCompletionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridStroke}
                vertical={false}
              />
              <XAxis
                dataKey="dayLabel"
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: gridStroke }}
                dy={6}
              />
              <YAxis
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                dx={-4}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="completed"
                name="Tâches terminées"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#taskCompletionGradient)"
                dot={{
                  r: 4,
                  fill: '#6366f1',
                  stroke: isDark ? '#18181b' : '#ffffff',
                  strokeWidth: 2
                }}
                activeDot={{
                  r: 6,
                  fill: '#818cf8',
                  stroke: '#4338ca',
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={stats.data}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridStroke}
                vertical={false}
              />
              <XAxis
                dataKey="dayLabel"
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: gridStroke }}
                dy={6}
              />
              <YAxis
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                dx={-4}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="completed"
                name="Tâches terminées"
                fill="#6366f1"
                radius={[5, 5, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-3 border-t border-zinc-200 dark:border-zinc-800/80 mt-3">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-zinc-400" />
          <span>Calculé en temps réel sur les 7 derniers jours glissants</span>
        </span>
        <span className="font-mono text-zinc-500 dark:text-zinc-400">
          Dernière màj : Aujourd'hui
        </span>
      </div>
    </div>
  );
};
