import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/image.jpg";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginUser = async () => {
    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/login/", {
        username,
        password,
      });
      // Store username in localStorage
      localStorage.setItem("username", response.data.username || username);
      localStorage.setItem("first_name", response.data.first_name || "");
      localStorage.setItem("last_name", response.data.last_name || "");
      navigate("/books");
    } catch {
      alert("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      loginUser();
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-content">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">
            Enter your details to login into the system.
          </p>
          
          <div className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                id="username"
                type="text"
                placeholder="vaishnavi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </div>

            <button 
              className="login-button" 
              onClick={loginUser}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </div>
      </div>
      
      <div className="login-right">
        <div 
          className="login-background-image"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        ></div>
      </div>
    </div>
  );
}

export default Login;
