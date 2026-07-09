import "./profile.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../../constants/backendUrl";
import { useNavigate } from "react-router";

function Profile() {
    const navigate = useNavigate();

    const token = localStorage.getItem("auth");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [dailyStudyHours, setDailyStudyHours] = useState(0);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); 

    const [originalName, setOriginalName] = useState("");
    const [originalEmail, setOriginalEmail] = useState("");
    const [originalHours, setOriginalHours] = useState(0);

    const getProfile = async () => {
        try {
            const response = await axios.get(
                `${backendUrl}/api/profile/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const user = response.data.data;

            setName(user.name);
            setEmail(user.email);
            setDailyStudyHours(user.dailyStudyHours); 

            setOriginalName(user.name);
        setOriginalEmail(user.email);
       setOriginalHours(user.dailyStudyHours);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    const handleSave = async () => {
    try {

        if (name !== originalName) {
            await axios.put(
                `${backendUrl}/api/profile/update-name`,
                { name },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        }

        if (email !== originalEmail) {
            await axios.put(
                `${backendUrl}/api/profile/update-email`,
                { newEmail: email },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        }

        if (dailyStudyHours !== originalHours) {
            await axios.put(
                `${backendUrl}/api/profile/update-daily-hours`,
                { newDailyHours: dailyStudyHours },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        }

        alert("Profile Updated Successfully ✅");

        getProfile();

    } catch (error) {
        console.log(error);
        alert("Update Failed");
    }
};

    const handleChangePassword = async () => {

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Please fill all password fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords don't match");
            return;
        }

        try {

            const response = await axios.put(
                `${backendUrl}/api/profile/change-password`,
                {
                    currentPassword,
                    newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            localStorage.setItem(
                "auth",
                response.data.data.token
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            alert("Password Changed Successfully ✅");

        } catch (error) {
            console.log(error);
            alert("Failed To Change Password");
        }
    };

    const handleDelete = async () => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete your account?"
        );

        if (!confirmDelete) return;

        try {

            await axios.delete(
                `${backendUrl}/api/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            localStorage.removeItem("auth");

            navigate("/");

        } catch (error) {
            console.log(error);
            alert("Delete Failed");
        }
    };

    return (
        <div className="profile-page">

            <h1 className="profile-title">
                My Profile
            </h1>

            <div className="profile-card">

                <div className="profile-image"></div>

                <div className="profile-info">

                    <div className="profile-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="profile-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="profile-group">
                        <label>Daily Study Hours</label>
                        <input
                            type="number"
                            value={dailyStudyHours}
                            onChange={(e) =>
                                setDailyStudyHours(Number(e.target.value))
                            }
                        />
                    </div>

                    <button
                        className="save-btn"
                        onClick={handleSave}
                    >
                        Save Changes
                    </button>

                    <hr />

                    <h2>Change Password</h2>

                    <div className="profile-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) =>
                                setCurrentPassword(e.target.value)
                            }
                        />
                    </div>

                    <div className="profile-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) =>
                                setNewPassword(e.target.value)
                            }
                        />
                    </div>  
                                        <div className="profile-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                        />
                    </div>

                    <button
                        className="save-btn"
                        onClick={handleChangePassword}
                    >
                        Change Password
                    </button>

                    <hr />

                    <button
                        className="delete-btn"
                        onClick={handleDelete}
                    >
                        Delete Account
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Profile;