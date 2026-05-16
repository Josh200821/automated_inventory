import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import './Navbar.css';
import logoutIcon from "../../assets/rename.png"
import home1 from "../../assets/home1.png"
import graph from "../../assets/graph.png"
import inventory from "../../assets/inventory.png"
import sales from "../../assets/sales.png"
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

const handleLogout = async () => {
  try {
    console.log("Logout button clicked");
    await logout();   
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    navigate("/login"); 
  }
  };


  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar}>
          <span className={`hamburger ${isCollapsed ? 'collapsed' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        {!isCollapsed && (
          <div className="brand-info">
            <h2>SPARK(AITS)</h2>
            <p>Inventory Control</p>
          </div>
        )}
      </div>

      <div className="sidebar-content">
        {user && (
          <div className="user-section">
            <div className="user-avatar">
              <span>{user.username.charAt(0).toUpperCase()}</span>
            </div>
            {!isCollapsed && (
              <div className="user-details">
                <span className="user-name">{user.username}</span>
                <span className="user-role">{user.role}</span>
                <span className='user-name'>Company: {user.company}</span>
              </div>
            )}
          </div>
        )}

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-title">Main</h3>
            <ul className="nav-list">
              <li className="nav-item">
                <button 
                  onClick={() => handleNavigation('/')} 
                  className={`nav-link ${isActive('/') ? 'active' : ''}`}
                >
                  <span className="nav-icon"><img src={home1} style={{ width:"30px" }}/></span>
                  {!isCollapsed && <span>Home</span>}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  onClick={() => handleNavigation('/products')} 
                  className={`nav-link ${isActive('/products') ? 'active' : ''}`}
                >
                  <span className="nav-icon"><img src={inventory} style={{ width:"30px" }}/></span>
                  {!isCollapsed && <span>Products</span>}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  onClick={() => handleNavigation('/stock')} 
                  className={`nav-link ${isActive('/stock') ? 'active' : ''}`}
                >
                  <span className="nav-icon"><img src={graph} style={{ width:"30px" }}/></span>
                  {!isCollapsed && <span>Stock</span>}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  onClick={() => handleNavigation('/movements')} 
                  className={`nav-link ${isActive('/movements') ? 'active' : ''}`}
                >
                  <span className="nav-icon"><img src={sales} style={{ width:"30px" }}/></span>
                  {!isCollapsed && <span>Movements</span>}
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="sidebar-footer">
        <button 
          className="logout-btn" 
          onClick={handleLogout}
          title="Logout"
        >
          <span className="logout-icon"> <img src={logoutIcon} style={{ width:"30px" }}/></span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
