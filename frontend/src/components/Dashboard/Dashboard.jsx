import React, { useState, useEffect } from 'react';
import api from '../../api';
import Navbar from '../Navbar/Navbar';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    products: [],
    stock: [],
    movements: []
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStockValue: 0,
    lowStockItems: 0,
    recentMovements: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, stockRes, movementsRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/stock'),
        api.get('/api/movements')
      ]);

      const products = productsRes.data;
      const stock = stockRes.data;
      const movements = movementsRes.data;

      setDashboardData({ products, stock, movements });

      // Calculate statistics
      const totalProducts = products.length;
      const totalStockValue = stock.reduce((sum, item) => {
        const product = products.find(p => p.id === item.product_id);
        return sum + (product ? product.cost_price * item.quantity_on_hand : 0);
      }, 0);
      const lowStockItems = stock.filter(item => item.quantity_on_hand <= 10).length;
      const recentMovements = movements.filter(movement => {
        const movementDate = new Date(movement.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return movementDate >= weekAgo;
      }).length;

      setStats({
        totalProducts,
        totalStockValue,
        lowStockItems,
        recentMovements
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      alert('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 0) return { status: 'out', color: '#e74c3c', text: 'Out of Stock' };
    if (quantity <= 10) return { status: 'low', color: '#f39c12', text: 'Low Stock' };
    return { status: 'good', color: '#27ae60', text: 'In Stock' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <button 
          className="refresh-btn"
          onClick={fetchDashboardData}
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <span className="stat-number">{stats.totalProducts}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Stock Value</h3>
            <span className="stat-number">{formatCurrency(stats.totalStockValue)}</span>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Low Stock Items</h3>
            <span className="stat-number">{stats.lowStockItems}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Recent Movements</h3>
            <span className="stat-number">{stats.recentMovements}</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="dashboard-grid">
        {/* Products Overview */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Products Overview</h2>
            <span className="section-count">{dashboardData.products.length} products</span>
          </div>
          <div className="products-preview">
            {dashboardData.products.slice(0, 5).map(product => (
              <div key={product.id} className="product-item">
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <span className="product-sku">SKU: {product.sku}</span>
                </div>
                <div className="product-price">
                  <span className="sell-price">${product.sell_price}</span>
                </div>
              </div>
            ))}
            {dashboardData.products.length > 5 && (
              <div className="more-items">
                +{dashboardData.products.length - 5} more products
              </div>
            )}
          </div>
        </div>

        {/* Stock Overview */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Stock Levels</h2>
            <span className="section-count">{dashboardData.stock.length} locations</span>
          </div>
          <div className="stock-preview">
            {dashboardData.stock.slice(0, 5).map(stock => {
              const stockStatus = getStockStatus(stock.quantity_on_hand);
              return (
                <div key={stock.id} className="stock-item">
                  <div className="stock-info">
                    <h4>{stock.product}</h4>
                    <span className="stock-location">📍 {stock.location}</span>
                  </div>
                  <div className="stock-details">
                    <span className="stock-quantity">{stock.quantity_on_hand}</span>
                    <span 
                      className="stock-status"
                      style={{ color: stockStatus.color }}
                    >
                      {stockStatus.text}
                    </span>
                  </div>
                </div>
              );
            })}
            {dashboardData.stock.length > 5 && (
              <div className="more-items">
                +{dashboardData.stock.length - 5} more stock items
              </div>
            )}
          </div>
        </div>

        {/* Recent Movements */}
        <div className="dashboard-section full-width">
          <div className="section-header">
            <h2>Recent Stock Movements</h2>
            <span className="section-count">{dashboardData.movements.length} total movements</span>
          </div>
          <div className="movements-preview">
            {dashboardData.movements.slice(0, 10).map(movement => (
              <div key={movement.id} className="movement-item">
                <div className="movement-icon">
                  {movement.movement_type === 'receipt' ? '📦' : 
                   movement.movement_type === 'sale' ? '💰' : '🔧'}
                </div>
                <div className="movement-info">
                  <h4>{movement.product}</h4>
                  <span className="movement-details">
                    {movement.movement_type.toUpperCase()} • {movement.location}
                  </span>
                </div>
                <div className="movement-quantity">
                  <span className={`qty-change ${movement.qty_change > 0 ? 'positive' : 'negative'}`}>
                    {movement.qty_change > 0 ? '+' : ''}{movement.qty_change}
                  </span>
                </div>
                <div className="movement-date">
                  {new Date(movement.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            {dashboardData.movements.length > 10 && (
              <div className="more-items">
                +{dashboardData.movements.length - 10} more movements
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
