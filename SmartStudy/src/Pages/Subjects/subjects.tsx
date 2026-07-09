import { useState, useEffect } from "react"
import axios from "axios"
import "./subjects.css"
import { backendUrl } from "../../constants/backendUrl"

interface Subject {
    _id: string
    name: string
    difficulty: number // 1-5 (backend format)
    examDate: string
    targetHoursPerWeek: number
}

const getLocalDateString = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Map the friendly UI labels to the 1-5 scale the backend expects
const DIFFICULTY_TO_NUMBER: Record<string, number> = { EASY: 1, MEDIUM: 3, HARD: 5 };
const NUMBER_TO_DIFFICULTY = (n: number): "EASY" | "MEDIUM" | "HARD" => {
    if (n <= 2) return "EASY";
    if (n <= 3) return "MEDIUM";
    return "HARD";
};

function Subjects() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        difficulty: "MEDIUM",
        examDate: "",
        hoursPerWeek: ""
    })

    const getToken = () => localStorage.getItem("auth");

    const fetchSubjects = () => {
        const token = getToken();
        if (!token) {
            setLoading(false);
            return;
        }
        axios
            .get(`${backendUrl}/api/subject`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setSubjects(res.data.data))
            .catch((err) => console.error("Failed to load subjects", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.examDate || !formData.hoursPerWeek) {
            alert("Please fill all fields")
            return
        }

        const token = getToken();
        if (!token) {
            alert("You are not logged in.");
            return;
        }

        const payload = {
            name: formData.name,
            difficulty: DIFFICULTY_TO_NUMBER[formData.difficulty],
            examDate: formData.examDate,
            targetHoursPerWeek: parseInt(formData.hoursPerWeek),
        };

        try {
            if (editingId) {
                await axios.patch(`${backendUrl}/api/subject/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEditingId(null);
            } else {
                await axios.post(`${backendUrl}/api/subject`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setFormData({ name: "", difficulty: "MEDIUM", examDate: "", hoursPerWeek: "" });
            fetchSubjects();
        } catch (err) {
            console.error("Failed to save subject", err);
            alert("Could not save subject. Please try again.");
        }
    }

    const handleDeleteSubject = async (id: string) => {
        const token = getToken();
        if (!token) return;
        try {
            await axios.delete(`${backendUrl}/api/subject/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (editingId === id) handleCancelEdit();
            fetchSubjects();
        } catch (err) {
            console.error("Failed to delete subject", err);
            alert("Could not delete subject. Please try again.");
        }
    }

    const handleEditSubject = (subject: Subject) => {
        setEditingId(subject._id)
        setFormData({
            name: subject.name,
            difficulty: NUMBER_TO_DIFFICULTY(subject.difficulty),
            examDate: subject.examDate.split("T")[0],
            hoursPerWeek: subject.targetHoursPerWeek.toString()
        })
        window.scrollTo(0, 0)
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setFormData({ name: "", difficulty: "MEDIUM", examDate: "", hoursPerWeek: "" })
    }

    const getDifficultyColor = (difficulty: number) => {
        const label = NUMBER_TO_DIFFICULTY(difficulty);
        switch (label) {
            case "EASY":
                return "#22b98911"
            case "MEDIUM":
                return "#ffd10011"
            case "HARD":
                return "#ff666611"
            default:
                return "#22b98911"
        }
    }

    return (
        <div className="subjects-container">
            <h1 className="subjects-title">Subjects</h1>
            <p className="subjects-description">
                Add the courses you need to study. Set difficulty, exam date and weekly hours
                so the planner can prioritise correctly.
            </p>

            <form className="subjects-form" onSubmit={handleAddSubject}>
                <div className="form-row">
                    <input
                        type="text"
                        name="name"
                        placeholder="Subject Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input"
                    />

                    <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                        className="form-input"
                    >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                    </select>

                    <input
                        type="date"
                        name="examDate"
                        value={formData.examDate}
                        onChange={handleInputChange}
                        className="form-input"
                        min={getLocalDateString()}
                    />

                    <input
                        type="number"
                        name="hoursPerWeek"
                        placeholder="Hours per week"
                        value={formData.hoursPerWeek}
                        onChange={handleInputChange}
                        className="form-input"
                    />

                    <button type="submit" className="add-subject-btn">
                        {editingId ? "Update Subject" : "Add Subject"}
                    </button>
                    {editingId && (
                        <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {loading ? (
                <p style={{ color: "#a1a1aa" }}>Loading subjects...</p>
            ) : (
                <div className="subjects-grid">
                    {subjects.map(subject => (
                        <div key={subject._id} className="subject-card">
                            <div className="card-header">
                                <h2 className="subject-name">{subject.name}</h2>
                                <span
                                    className="difficulty-badge"
                                    style={{ backgroundColor: getDifficultyColor(subject.difficulty) }}
                                >
                                    {NUMBER_TO_DIFFICULTY(subject.difficulty)}
                                </span>
                            </div>

                            <div className="card-info">
                                <div className="info-item">
                                    <p className="info-label">EXAM</p>
                                    <p className="info-value">{subject.examDate.split("T")[0]}</p>
                                </div>
                                <div className="info-item">
                                    <p className="info-label">PER WEEK</p>
                                    <p className="info-value">{subject.targetHoursPerWeek}h</p>
                                </div>
                            </div>

                            <div className="card-buttons">
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteSubject(subject._id)}
                                >
                                    Delete
                                </button>
                                <button
                                    className="edit-btn"
                                    onClick={() => handleEditSubject(subject)}
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Subjects
