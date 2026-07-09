import { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowUpRight,  BookOpen, CheckCircle2, Flame, Plus, Timer } from 'lucide-react';
import { backendUrl } from '../../constants/backendUrl';
import CompletionDonutChart from '../../components/CompletionDonutChart';

interface WeeklyHoursEntry {
  day: string;
  date: string;
  hours: number;
}

interface SubjectProgressEntry {
  subjectId: string;
  name: string;
  percent: number;
}

interface DashboardData {
  studyHoursThisWeek: number;
  studyHoursDeltaVsLastWeek: number;
  subjectsCount: number;
  examsThisWeek: number;
  tasksCompletedPercent: number;
  pomodorosToday: number;
  pomodoroGoalToday: number;
  weeklyStudyHours: WeeklyHoursEntry[];
  subjectProgress: SubjectProgressEntry[];
  todaysSessionsCount: number;
}

const COLOR_CYCLE = ['teal', 'indigo', 'orange', 'red', 'purple', 'blue'];
const COLOR_MAP: Record<string, string> = {
  teal: 'bg-[#10b981]',
  indigo: 'bg-indigo-400',
  orange: 'bg-amber-400',
  red: 'bg-rose-500',
  purple: 'bg-purple-500',
  blue: 'bg-blue-400',
};

const getStatusLabel = (percent: number) => {
  if (percent >= 70) return 'On track';
  if (percent >= 40) return 'Needs attention';
  return 'Behind schedule';
};

const getStatusColor = (percent: number) => {
  if (percent >= 70) return 'text-[#10b981]';
  if (percent >= 40) return 'text-amber-400';
  return 'text-rose-400';
};

export default function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth');
    if (!token) {
      setError('You are not logged in.');
      setLoading(false);
      return;
    }

    axios.get(`${backendUrl}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setData(res.data.data))         
      .catch((err) => {
        console.error('Failed to load dashboard', err);
        setError('Could not load dashboard data.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 bg-[#121214] min-h-screen flex items-center justify-center"><p className="text-zinc-400">Loading dashboard...</p></div>;
  if (error || !data) return <div className="p-8 bg-[#121214] min-h-screen flex items-center justify-center"><p className="text-rose-400">{error ?? 'Something went wrong.'}</p></div>;

  const {
    studyHoursThisWeek, studyHoursDeltaVsLastWeek, subjectsCount, examsThisWeek,
    tasksCompletedPercent, pomodorosToday, pomodoroGoalToday,
    weeklyStudyHours, subjectProgress, todaysSessionsCount
  } = data;

  const isImprovement = studyHoursDeltaVsLastWeek >= 0;
  const subjectsForChart = subjectProgress.map((s, i) => ({
    id: s.subjectId,
    name: s.name,
    color: COLOR_CYCLE[i % COLOR_CYCLE.length],
    progress: s.percent,
  }));

  const scaleMax = Math.max(10, ...weeklyStudyHours.map(d => d.hours));
  const scaleTicks = [scaleMax, scaleMax*0.8, scaleMax*0.6, scaleMax*0.4, scaleMax*0.2, 0].map(n => Math.round(n));

  return (
    <div className="bg-[#121214] min-h-screen py-16 px-8">

      {/* Header */}
      <div className="flex justify-between items-start mb-16">
        <div>
          <h1 className="text-3xl font-bold text-white">Good morning 👋</h1>
          <p className="text-zinc-400 mt-1">
            {todaysSessionsCount > 0 
              ? `You have ${todaysSessionsCount} sessions scheduled today` 
              : 'All caught up for today! Add a new task to get started.'}
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-sm font-semibold">
          <Plus className="h-4 w-4 text-[#10b981]" /> New Plan
        </button>
      </div>

      {/* Top 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 mb-24">
        <div className="bg-[#1c1c1e] border border-zinc-800 rounded-3xl p-7">
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs uppercase tracking-widest text-zinc-400">Study hours this week</span>
            <Flame className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-5xl font-bold text-white mb-2">{studyHoursThisWeek}</div>
          <div className={`flex items-center gap-1 text-sm ${isImprovement ? 'text-emerald-400' : 'text-rose-400'}`}>
            <ArrowUpRight className="h-4 w-4" /> {isImprovement ? '+' : ''}{studyHoursDeltaVsLastWeek} vs last week
          </div>
        </div>

        <div className="bg-[#1c1c1e] border border-zinc-800 rounded-3xl p-7">
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs uppercase tracking-widest text-zinc-400">Subjects tracked</span>
            <BookOpen className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-5xl font-bold text-white mb-2">{subjectsCount}</div>
          <div className="text-sm text-zinc-500">{examsThisWeek} exams scheduled soon</div>
        </div>

        <div className="bg-[#1c1c1e] border border-zinc-800 rounded-3xl p-7">
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs uppercase tracking-widest text-zinc-400">Tasks completed</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-5xl font-bold text-white mb-2">{tasksCompletedPercent}%</div>
          <div className={`text-sm ${getStatusColor(tasksCompletedPercent)}`}>{getStatusLabel(tasksCompletedPercent)}</div>
        </div>

        <div className="bg-[#1c1c1e] border border-zinc-800 rounded-3xl p-7">
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs uppercase tracking-widest text-zinc-400">Pomodoros today</span>
            <Timer className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-5xl font-bold text-white mb-2">{pomodorosToday}</div>
          <div className="text-sm text-zinc-500">Goal: {pomodoroGoalToday}</div>
        </div>
      </div>

      {/* Weekly + Subject Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-20">
        {/* Weekly Study Hours */}
        <div className="lg:col-span-3 bg-[#1c1c1e] border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-2">Weekly study hours</h2>
          <p className="text-xs text-zinc-500 mb-8">Mon—Sun</p>
          
          <div className="flex gap-6 h-72">
            <div className="flex flex-col justify-between text-xs text-zinc-500 font-mono pt-1">
              {scaleTicks.map(t => <span key={t}>{t}</span>)}
            </div>
            <div className="flex-1 flex items-end gap-5">
              {weeklyStudyHours.map((entry, i) => {
                const height = Math.round((entry.hours / scaleMax) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full">
                    <div className="w-full bg-emerald-500/20 rounded-t-3xl flex-1 flex items-end">
                      <div className="bg-[#10b981] w-full rounded-t-3xl" style={{height: `${height}%`}} />
                    </div>
                    <span className="text-xs mt-4 text-zinc-400">{entry.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Subject Progress */}
        <div className="lg:col-span-2 bg-[#1c1c1e] border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-8">Subject progress</h2>
          
          {subjectsForChart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <BookOpen className="h-16 w-16 text-zinc-600 mb-6" />
              <p className="text-white text-lg">No subjects yet</p>
              <p className="text-zinc-500 mt-2">Add subjects to see progress here</p>
            </div>
          ) : (
            <div className="space-y-8 pt-4">
              {subjectsForChart.map(s => (
                <div key={s.id}>
                  <div className="flex justify-between mb-3 text-sm">
                    <span>{s.name}</span>
                    <span className="font-mono">{s.progress}%</span>
                  </div>
                  <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`${COLOR_MAP[s.color]} h-full rounded-full`} style={{width: `${s.progress}%`}} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CompletionDonutChart subjects={subjectsForChart} />
    </div>
  );
}