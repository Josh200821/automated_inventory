import { useState, useContext } from "react";
import api from "../api";
import { useNavigate , Link } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "./Form.css"
import LoadingIndicator from "./LoadingIndicator";
import { AuthContext } from "../AuthContext";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [role , setRole] = useState("storekeeper");
    const [password, setPassword] = useState("");
    const [company , setCompany] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const requestData = method === "login" 
                ? { email, password }
                : { username, email, password, company, role};
            
            const res = await api.post(route, requestData);
            
            if (method === "login") {
                
                login(res.data.access, res.data.user);
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            alert(error.response?.data?.error || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-wrapper">
            <div className="form-header">
                <h1 className="brand-title">SPARK(AITS)</h1>
                <p className="brand-subtitle">Automated Inventory Control System at its finest</p>
            </div>
            
            <form onSubmit={handleSubmit} className="form-container">
                <h1 className="form-title">{name}</h1>
            {method === "register" && (
                <>
                <input
                    className="form-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
                <input 
                    className="form-input"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company's name"
                    required
                />
                </>

            )}
            {method === "register" && (
            <div>
                <h3 style={{ color:"#fff" }}>Select Your Role:</h3>

                <label style={{ color:"#fff" }}>
                    <input
                    type="radio"
                    value="storekeeper"
                    checked={role === "storekeeper"}
                    onChange={(e) => setRole(e.target.value)}
                    />
                    Store keeper
                </label>

                <label style={{ marginLeft: "20px" , color:"#fff" , marginBottom:"30px" }}>
                    <input
                    type="radio"
                    value="storemanager"
                    checked={role === "storemanager"}
                    onChange={(e) => setRole(e.target.value)}
                    />
                    Store Manager
                </label> 
                </div>
            )

            }
            <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            {method === "login" && (
                <p style={{ color: "white" }}>
                    If you do not have an account?{" "}
                    <Link to="/signup" style={{ color: "", textDecoration: "underline" }}>
                    signup
                    </Link>
                </p>
            )}
            {method === "register" && (
            <p style={{color:"white"}}>
                go to {" "}
                <Link to="/login" style={{ color:"" , textDecoration:"under;line"}}>
                    login
                </Link>
            </p>
            )
            }
                {loading && <LoadingIndicator />}
                <button className="form-button" type="submit" disabled={loading}>
                    {loading ? "Processing..." : name}
                </button>
            </form>
        </div>
    );
}

export default Form