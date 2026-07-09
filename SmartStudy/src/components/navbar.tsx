import { useState } from "react";
import logo from "../assets/logo.png";
import "./navbar.css";
import { useNavigate } from "react-router";
import pomodoro from "../assets/clock.png";
import dashboard from "../assets/dashboard.png";
import subjects from "../assets/book.png";
import studyplan from "../assets/task.png";
import profile from "../assets/profile.png";
import { LogOut } from "lucide-react";
import axios from "axios";
import { backendUrl } from "../constants/backendUrl";

function Navbar() {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState("");

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("auth");

            await axios.post(
                `${backendUrl}/api/logout`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.log(error);
        }

        localStorage.removeItem("auth");
        navigate("/");
    };

    return (
        <div className="navbar">
            <div className="nav-header-container">
                <img className="nav-logo" src={logo} alt="" />
                <h1 className="nav-header">SmartStudy</h1>
            </div>

            <div className="nav-list">
                <p className="overview-label">Overview</p>

                <ul>
                    <li
                        className={`list-item ${activeItem === "Dashboard" ? "active" : ""}`}
                        onClick={() => {
                            setActiveItem("Dashboard");
                            navigate("/dashboard");
                        }}
                    >
                        <img src={dashboard} alt="" />
                        Dashboard
                    </li>

                    <li
                        className={`list-item ${activeItem === "subjects" ? "active" : ""}`}
                        onClick={() => {
                            setActiveItem("subjects");
                            navigate("/subjects");
                        }}
                    >
                        <img src={subjects} alt="" />
                        Subjects
                    </li>

                    <li
                        className={`list-item ${activeItem === "Study Plan" ? "active" : ""}`}
                        onClick={() => {
                            setActiveItem("Study Plan");
                            navigate("/studyplan");
                        }}
                    >
                        <img src={studyplan} alt="" />
                        Study Plan
                    </li>

                    <li
                        className={`list-item ${activeItem === "Pomodoro Timer" ? "active" : ""}`}
                        onClick={() => {
                            setActiveItem("Pomodoro Timer");
                            navigate("/pomodorotimer");
                        }}
                    >
                        <img src={pomodoro} alt="" />
                        Pomodoro Timer
                    </li>
                </ul>
            </div>

            <div
    className="profile"
    onClick={() => navigate("/profile")}
>
    <img
        src={profile}
        className="profile-img"
        alt=""
    />

    <p className="profile-text">
        Profile
    </p>
</div>

            <div className="logout-btn" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Logout</span>
            </div>
        </div>
    );
}

export default Navbar;