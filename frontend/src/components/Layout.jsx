import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Layout.css";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("User");
  const [userInitial, setUserInitial] = useState("U");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "User";
    const firstName = localStorage.getItem("first_name") || "";
    const lastName = localStorage.getItem("last_name") || "";
    
    let displayName = storedUsername;
    if (firstName || lastName) {
      displayName = `${firstName} ${lastName}`.trim() || storedUsername;
    } else {
      displayName = storedUsername.charAt(0).toUpperCase() + storedUsername.slice(1);
    }
    
    setUsername(displayName);
    setUserInitial(displayName.charAt(0).toUpperCase());
  }, []);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">webBooks</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">Home</div>
            <div className="nav-items">
              <button
                className={`nav-item ${location.pathname === "/add-book" ? "active" : ""}`}
                onClick={() => navigate("/add-book")}
              >
                <span className="nav-icon">⊞</span>
                <span className="nav-text">Add Book</span>
              </button>
              <button
                className={`nav-item ${location.pathname === "/books" ? "active" : ""}`}
                onClick={() => navigate("/books")}
              >
                <span className="nav-icon">📖</span>
                <span className="nav-text">Book Details</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="top-header">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate(-1)}>
              ←
            </button>
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
            />
          </div>
          <div className="header-right">
            <div className="user-profile">
              <div className="user-avatar">{userInitial}</div>
              <div className="user-info">
                <div className="user-name">{username}</div>
                <div className="user-role">Book Manager</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
