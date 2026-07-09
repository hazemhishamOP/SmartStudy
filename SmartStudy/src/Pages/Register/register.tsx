import logo from "../../assets/logo.png"
import './register.css'
import '../Login/login.css'
import { useNavigate } from "react-router"
import { useState } from "react"
import { backendUrl } from "../../constants/backendUrl"
import axios from "axios"

function Register() {
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rePassword, setRePassword] = useState("")
    const [studyTime, setStudyTime] = useState("")




    const handleRegister = async () => {
        if (!name || !email || !password || !rePassword || !studyTime) {
            alert("all fields are required")
            return;
        }
        if (password !== rePassword) {
            alert("passwords do not match")
            return;
        }
        try {
           const response = await axios.post(`${backendUrl}/api/register`, { name, email, password, dailyStudyHours: Number(studyTime) })
            if (response.data && response.data.data && response.data.data.token) {
                navigate("/dashboard")
                localStorage.setItem("auth", response.data.data.token)
                console.log("Welcome!")
            }
        }
        catch (error) {
            console.error("register error:", error)
            alert("Register failed. Please try again.")
        }







    }

    const handleLogin = () => {
        navigate("/")
    }



    return (

        <div className="register-container">
            <div className="hero">
                <div className='hero-logo'><img className='logo' src={logo} alt="" />
                    <h1 className='hero-title'>SmartStudy</h1>
                </div>
                <p className='hero-text'>Study Smarter, Not Harder</p>
            </div>


            <div className='register-box'>
                <h1 className="register-title">Register</h1>
                <p className="register-text">create an account</p>
                <p className="name-text">Name</p>
                <input type="text" className="name-input" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
                <p className="email-text">Email</p>

                <input type="text" className="email-input" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />

                <p className="password-text">Password</p>

                <input type="password" className="password-input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />

                <p className="re-password-text">Re-type-Password</p>

                <input type="password" className="re-password-input" placeholder="Re-type your password" value={rePassword} onChange={(e) => setRePassword(e.target.value)} />

                <p className="study-hours-text">Daily Study hours</p>

                <input type="number" className="Study-Time" placeholder="Daily Study Time (in hours)" value={studyTime} onChange={(e) => setStudyTime(e.target.value)} />

                <button onClick={handleRegister} className="register-btn">Register</button>
                <p className="login-text">Already Have An Account?<span className="login" onClick={handleLogin}>Login</span> </p>


            </div>
        </div>







    )
}

export default Register
