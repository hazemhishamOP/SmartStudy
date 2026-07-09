import { useState, useEffect } from "react"
import axios from "axios"
import "./studyplan.css"
import { backendUrl } from "../../constants/backendUrl"

interface PlanTask {
    _id: string
    day: string // ISO date e.g. "2026-07-08"
    time: string // "HH:mm"
    subjectId: { _id: string; name: string; icon?: string } | null
    topic: string
    durationMinutes: number
    status: "pending" | "done"
}

interface GroupedDay {
    date: string
    dayName: string
    tasks: PlanTask[]
    totalHours: number
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Difficulty-independent color per subject index, cycling through a small palette
const PALETTE = [
    { bg: "#22b98922", border: "#22b989" },
    { bg: "#60a5fa22", border: "#60a5fa" },
    { bg: "#ffd10022", border: "#ffd100" },
    { bg: "#ff666622", border: "#ff6666" },
    { bg: "#a855f722", border: "#a855f7" },
];

function Studyplan() {
    const [tasks, setTasks] = useState<PlanTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const getToken = () => localStorage.getItem("auth");

    const fetchPlan = () => {
        const token = getToken();
        if (!token) {
            setLoading(false);
            return;
        }
        axios
            .get(`${backendUrl}/api/plan`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setTasks(res.data.data))
            .catch((err) => console.error("Failed to load study plan", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPlan();
    }, []);

    const handleGeneratePlan = async () => {
        const token = getToken();
        if (!token) {
            alert("You are not logged in.");
            return;
        }
        setGenerating(true);
        try {
            await axios.post(
                `${backendUrl}/api/plan/generate`,
                {},
                { headers: { Authorization: `Bearer ${token}` } },
            );
            fetchPlan();
        } catch (err) {
            console.error("Failed to generate plan", err);
            alert("Could not generate a plan. Make sure you have subjects added first.");
        } finally {
            setGenerating(false);
        }
    };

    const handleToggleStatus = async (task: PlanTask) => {
        const token = getToken();
        if (!token) return;
        const newStatus = task.status === "done" ? "pending" : "done";
        try {
            await axios.patch(
                `${backendUrl}/api/plan/${task._id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            fetchPlan();
        } catch (err) {
            console.error("Failed to update task status", err);
        }
    };

    // Group flat task list into day cards, sorted chronologically
    const groupedDays: GroupedDay[] = (() => {
        const map = new Map<string, PlanTask[]>();
        for (const task of tasks) {
            const list = map.get(task.day) ?? [];
            list.push(task);
            map.set(task.day, list);
        }
        return Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dayTasks]) => {
                const dayTasksSorted = [...dayTasks].sort((a, b) => a.time.localeCompare(b.time));
                const totalMinutes = dayTasksSorted.reduce((sum, t) => sum + t.durationMinutes, 0);
                const dayName = DAY_NAMES[new Date(date + "T00:00:00").getDay()];
                return {
                    date,
                    dayName,
                    tasks: dayTasksSorted,
                    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
                };
            });
    })();

    const totalHours = Math.round(groupedDays.reduce((sum, d) => sum + d.totalHours, 0) * 10) / 10;
    const avgPerDay = groupedDays.length > 0 ? (totalHours / groupedDays.length).toFixed(1) : "0";
    const subjectsCovered = new Set(
        tasks.map((t) => t.subjectId?._id).filter(Boolean)
    ).size;

    const colorForSubject = (subjectId: string | undefined) => {
        if (!subjectId) return PALETTE[0];
        const uniqueIds = Array.from(new Set(tasks.map((t) => t.subjectId?._id).filter(Boolean)));
        const index = uniqueIds.indexOf(subjectId);
        return PALETTE[index % PALETTE.length];
    };

    return (
        <div className="studyplan-container">
            <h1 className="studyplan-title">Study Plan</h1>
            <p className="studyplan-description">
                Generate a personalised 7-day schedule based on your subjects, exam dates and
                difficulty. The plan is created automatically from your saved subjects.
            </p>

            <div className="studyplan-form">
                <div className="form-inputs">
                    <button
                        type="button"
                        className="generate-btn"
                        onClick={handleGeneratePlan}
                        disabled={generating}
                    >
                        {generating ? "Generating..." : "Generate Plan"}
                    </button>
                </div>
            </div>

            {loading ? (
                <p style={{ color: "#a1a1aa" }}>Loading study plan...</p>
            ) : groupedDays.length === 0 ? (
                <p style={{ color: "#a1a1aa" }}>
                    No plan yet. Add some subjects first, then click "Generate Plan".
                </p>
            ) : (
                <>
                    <div className="stats-container">
                        <div className="stat-card">
                            <p className="stat-label">TOTAL HOURS</p>
                            <p className="stat-value">{totalHours}h</p>
                        </div>
                        <div className="stat-card">
                            <p className="stat-label">AVG / DAY</p>
                            <p className="stat-value">{avgPerDay}h</p>
                        </div>
                        <div className="stat-card">
                            <p className="stat-label">SUBJECTS COVERED</p>
                            <p className="stat-value">{subjectsCovered}</p>
                        </div>
                    </div>

                    <div className="plan-schedule">
                        {groupedDays.map((day) => (
                            <div key={day.date} className="day-card">
                                <div className="day-header">
                                    <h3 className="day-name">{day.dayName}</h3>
                                    <p className="day-date">{day.date}</p>
                                </div>

                                <div className="day-sessions">
                                    {day.tasks.map((task) => {
                                        const color = colorForSubject(task.subjectId?._id);
                                        const isDone = task.status === "done";
                                        return (
                                            <div
                                                key={task._id}
                                                className="session-item"
                                                onClick={() => handleToggleStatus(task)}
                                                style={{
                                                    backgroundColor: color.bg,
                                                    borderLeft: `4px solid ${color.border}`,
                                                    cursor: "pointer",
                                                    opacity: isDone ? 0.55 : 1,
                                                    textDecoration: isDone ? "line-through" : "none",
                                                }}
                                                title={isDone ? "Click to mark as pending" : "Click to mark as done"}
                                            >
                                                <span className="session-subject">
                                                    {task.subjectId?.name ?? "Unknown"} — {task.topic} ({task.time})
                                                </span>
                                                <span className="session-hours">
                                                    {Math.round((task.durationMinutes / 60) * 10) / 10}h
                                                </span>
                                            </div>
                                        );
                                    })}

                                    <div className="day-total">
                                        <span className="total-label">Planned</span>
                                        <span className="total-hours">{day.totalHours}h</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default Studyplan
