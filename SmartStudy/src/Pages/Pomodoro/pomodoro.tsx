import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Play,
    Pause,
    SkipForward,
    RotateCcw,
    Volume2,
    VolumeX
} from 'lucide-react';
import { backendUrl } from '../../constants/backendUrl';

interface PomodoroSessionAPI {
    _id: string;
    day: string;
    sessionIndex: number;
    type: 'work' | 'short_break' | 'long_break';
    subjectId: { _id: string; name: string; icon?: string } | null;
    topic: string | null;
    durationMinutes: number;
    status: 'pending' | 'completed';
    completedAt: string | null;
}

interface TodayData {
    sessions: PomodoroSessionAPI[];
    currentSessionIndex: number;
    completedWorkSessions: number;
    totalWorkSessions: number;
    totalMinutesToday: number;
}

export default function PomodoroView() {
    const [data, setData] = useState<TodayData | null>(null);
    const [loading, setLoading] = useState(true);

    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const initialDurationRef = useRef(0);

    const getToken = () => localStorage.getItem('auth');

    const fetchToday = () => {
        const token = getToken();
        if (!token) {
            setLoading(false);
            return;
        }
        axios
            .get(`${backendUrl}/api/pomodoro/today`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setData(res.data.data))
            .catch((err) => console.error('Failed to load pomodoro sessions', err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchToday();
    }, []);


    const activeSession = data?.sessions.find((s) => s.status === 'pending') ?? null;

   
    useEffect(() => {
        if (!isTimerRunning && activeSession) {
            const secs = activeSession.durationMinutes * 60;
            setTimeLeft(secs);
            initialDurationRef.current = secs;
        }
       
    }, [activeSession?._id]);

    useEffect(() => {
        let timerId: ReturnType<typeof setInterval> | null = null;
        if (isTimerRunning && activeSession) {
            timerId = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsTimerRunning(false);
                        if (timerId) clearInterval(timerId);
                        handleCompleteSession(activeSession._id);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerId) clearInterval(timerId);
        };
       
    }, [isTimerRunning, activeSession?._id]);

    const handleCompleteSession = async (sessionId: string) => {
        const token = getToken();
        if (!token) return;
        try {
            await axios.post(
                `${backendUrl}/api/pomodoro/sessions/${sessionId}/complete`,
                {},
                { headers: { Authorization: `Bearer ${token}` } },
            );
            if (!isMuted) {
                try {
                    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.5);
                } catch (err) {
                    console.warn('Audio alert not supported', err);
                }
            }
            fetchToday();
        } catch (err) {
            console.error('Failed to complete session', err);
        }
    };

    const toggleTimer = () => {
        if (!activeSession) return;
        setIsTimerRunning((r) => !r);
    };

    const skipSession = () => {
        if (!activeSession) return;
        setIsTimerRunning(false);
        handleCompleteSession(activeSession._id);
    };

    const resetTimer = () => {
        if (!activeSession) return;
        setIsTimerRunning(false);
        const secs = activeSession.durationMinutes * 60;
        setTimeLeft(secs);
        initialDurationRef.current = secs;
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const radius = 70;
    const strokeWidth = 6;
    const circumference = 2 * Math.PI * radius;
    const percentage = initialDurationRef.current > 0 ? (timeLeft / initialDurationRef.current) * 100 : 0;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    if (loading) {
        return (
            <div className="p-8 bg-[#121214] min-h-screen flex items-center justify-center">
                <p className="text-zinc-400">Loading Pomodoro sessions...</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-[#121214] min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-display text-2xl font-bold text-white tracking-tight">Pomodoro Timer</h1>
                    <p className="text-zinc-400 text-sm mt-1">Stay focused with structured sessions</p>
                </div>
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2.5 bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/60 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-2 text-xs font-semibold"
                >
                    {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-[#10b981]" />}
                    <span>{isMuted ? 'Muted' : 'Sound On'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-[#1c1c1e] border border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center relative min-h-[440px]">
                    <span className="absolute top-6 left-6 text-xs font-bold tracking-wider text-zinc-500 uppercase">
                        {activeSession?.type === 'work' || !activeSession ? 'Focus session' : activeSession.type === 'short_break' ? 'Short break' : 'Long break'}
                    </span>

                    {!activeSession ? (
                        <div className="text-center">
                            <p className="text-white text-lg mb-2">No sessions for today</p>
                            <p className="text-zinc-500 text-sm">Generate a study plan to get Pomodoro sessions here.</p>
                        </div>
                    ) : (
                        <>
                            <div className="relative flex items-center justify-center my-6">
                                <svg className="w-56 h-56 transform -rotate-90">
                                    <circle cx="112" cy="112" r={radius} className="stroke-zinc-800/80" strokeWidth={strokeWidth} fill="transparent" />
                                    <circle
                                        cx="112"
                                        cy="112"
                                        r={radius}
                                        className={activeSession.type === 'work' ? 'stroke-[#10b981]' : 'stroke-indigo-400'}
                                        strokeWidth={strokeWidth}
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 0.3s' }}
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <span className="text-4xl font-mono font-bold text-white tracking-tight block">
                                        {formatTime(timeLeft)}
                                    </span>
                                    <span className="text-xs text-zinc-500 font-medium block mt-1">
                                        {isTimerRunning ? 'Running' : 'Paused'}
                                    </span>
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <h3 className="font-display font-bold text-base text-zinc-300">
                                    {activeSession.type === 'work'
                                        ? `${activeSession.subjectId?.name ?? 'Unknown'} — ${activeSession.topic ?? ''}`
                                        : 'Take a break'}
                                </h3>
                                <span className="text-[11px] text-zinc-500 font-mono mt-1 block">
                                    Session {data!.sessions.findIndex((s) => s._id === activeSession._id) + 1} of {data!.sessions.length}
                                </span>
                            </div>

                            <div className="flex items-center gap-6 mb-6">
                                <button
                                    onClick={toggleTimer}
                                    className="px-6 py-4 bg-[#10b981] hover:bg-[#059669] text-[#121214] font-bold rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 cursor-pointer transition-all transform active:scale-95"
                                    title={isTimerRunning ? 'Pause Session' : 'Start Focus'}
                                >
                                    {isTimerRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                                </button>

                                <button
                                    onClick={skipSession}
                                    className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl cursor-pointer transition-all active:scale-90"
                                    title="Mark complete & skip to next"
                                >
                                    <SkipForward className="h-4 w-4" />
                                </button>

                                <button
                                    onClick={resetTimer}
                                    className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl cursor-pointer transition-all active:scale-90"
                                    title="Reset Timer"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="flex gap-2.5 mb-2 flex-wrap justify-center max-w-xs">
                                    {data!.sessions.map((s) => (
                                        <span
                                            key={s._id}
                                            className={`w-3 h-3 rounded-full ${
                                                s._id === activeSession._id
                                                    ? 'bg-[#10b981] ring-4 ring-[#10b981]/20 scale-110'
                                                    : s.status === 'completed'
                                                    ? 'bg-[#10b981]/60'
                                                    : 'bg-zinc-800'
                                            }`}
                                            title={s.type === 'work' ? s.topic ?? 'Work' : s.type}
                                        />
                                    ))}
                                </div>
                                <span className="text-[11px] text-zinc-500 font-mono font-medium uppercase mt-1">
                                    {data!.completedWorkSessions} of {data!.totalWorkSessions} focus blocks done
                                </span>
                            </div>
                        </>
                    )}
                </div>

                <div className="lg:col-span-2 bg-[#1c1c1e] border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="font-display font-bold text-base text-white mb-6">Today's sessions</h2>

                        {!data || data.sessions.length === 0 ? (
                            <p className="text-sm text-zinc-500">
                                No sessions scheduled yet. Generate a study plan to see today's sessions here.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto no-scrollbar">
                                {data.sessions.map((s) => {
                                    const isActive = s._id === activeSession?._id;
                                    const isDone = s.status === 'completed';
                                    const label =
                                        s.type === 'work'
                                            ? `${s.subjectId?.name ?? 'Unknown'} — ${s.topic ?? ''}`
                                            : s.type === 'short_break'
                                            ? 'Short break'
                                            : 'Long break';
                                    return (
                                        <div
                                            key={s._id}
                                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left w-full ${
                                                isActive
                                                    ? 'bg-zinc-800/80 border-[#10b981]/60 text-white'
                                                    : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`w-2.5 h-2.5 rounded-full ${
                                                    isDone ? 'bg-[#10b981]' : isActive ? 'bg-[#10b981] animate-pulse' : 'bg-zinc-700'
                                                }`} />
                                                <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                                                    {label}
                                                </span>
                                            </div>
                                            <span className="text-xs font-mono text-zinc-400">{s.durationMinutes} min</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-sm font-medium">
                        <span className="text-zinc-400">Total today</span>
                        <span className="font-mono text-white font-bold">{data?.totalMinutesToday ?? 0} min</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
