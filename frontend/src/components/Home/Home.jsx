import React, { useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import Navbar from '../Navbar/Navbar';
import inventory from "../../assets/inventory.png"
import graph from "../../assets/graph.png"
import sales from "../../assets/sales.png"
import './Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="home-container">
      <Navbar />
      <main className="main-content">
        <div className="welcome-section">
          <h1>Welcome to SPARK(AITS)</h1>
          <p className="subtitle">Automated Inventory Control System at its finest</p>
          
          {user && (
            <div className="user-welcome">
              <h2>Hello, {user.username}!</h2>
            </div>
          )}
          
          <div className="features-grid">
            <div className="feature-card">
              <h3><img src={sales} style={{ width:"30px" }}/> inventory</h3>
              <p>Track and manage your inventory with ease</p>
            </div>
            <div className="feature-card">
              <h3><img src={graph} style={{ width:"30px" }}/> Stock Monitoring</h3>
              <p>Monitor stock levels and movements in real-time</p>
            </div>
            <div className="feature-card">
              <h3><img src={inventory} style={{ width:"30px" }}/> Automated Control</h3>
              <p>Automated inventory control at its finest</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home
