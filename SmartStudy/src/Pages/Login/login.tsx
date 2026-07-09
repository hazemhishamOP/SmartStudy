import './login.css'
import logo from "../../assets/logo.png"
import { backendUrl } from "../../constants/backendUrl"
import { useState } from "react"
import axios from "axios"
import { useNavigate } from 'react-router'


function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleLogIn = async () => {
        if (!email || !password) {
            alert("all fields are required")
            return;
        }
        try {
            const response = await axios.post(`${backendUrl}/api/login`, { email, password })
            if (response.data && response.data.data && response.data.data.token) {
                navigate("/dashboard")
                localStorage.setItem("auth", response.data.data.token)
                console.log("welcome back!!!")
            }
        }
        catch (error) {
            console.error("Login error:", error);
            alert("Login failed. Please check your credentials.");
        }
    }
    const handleRegister = () => {
        navigate("/register")
    }

    return (
        <div className="login-container">
            <div className="hero">
                <div className='hero-logo'><img className='logo' src={logo} alt="" />
                    <h1 className='hero-title'>SmartStudy</h1>
                </div>
                <p className='hero-text'>Study Smarter, Not Harder</p>
            </div>
            <div className="login-box">
                <h1 className='login-title'>Welcome Back!!</h1>
                <p className='login-text'>sign in into your account</p>
                <p className='email-text'>Email</p>
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} type="text" className='email-input' />
                <p className='password-text'>Password</p>
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="text" className='password-input' />
                <button onClick={handleLogIn} className='login-btn'>Login</button>
                <p className='register-text'>Dont Have An Acoount?<span className='register' onClick={handleRegister}>Register</span> </p>
            </div>
        </div>
    )
}

export default Login
