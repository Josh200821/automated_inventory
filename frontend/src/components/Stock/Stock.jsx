import React, { useState, useEffect , useContext } from 'react';
import api from '../../api';
import Navbar from '../Navbar/Navbar';
import LoadingIndicator from '../LoadingIndicator.jsx';
import './Stock.css';
import { AuthContext } from '../../AuthContext.jsx';

const Stock = () => {
  const [stockLevels, setStockLevels] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    product_id: '',
    location: 'Main Warehouse',
    quantity_on_hand: ''
  });
  // Analytics state
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [tablePreview, setTablePreview] = useState({ columns: [], rows: [], total_rows: 0 });
  const [plotKind, setPlotKind] = useState('bar');
  const [plotColumn, setPlotColumn] = useState('');
  const [filesLoading, setFilesLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [plotLoading, setPlotLoading] = useState(false);
  const [showTable, setShowTable] = useState(true);

  useEffect(() => {
    fetchData();
    fetchArchiveFiles();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stockResponse, productsResponse] = await Promise.all([
        api.get('/api/stock'),
        api.get('/api/products')
      ]);
      setStockLevels(stockResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  };

  const fetchArchiveFiles = async () => {
    try {
      setFilesLoading(true);
      const res = await api.get('/api/analytics/files');
      setFiles(res.data.files || []);
      if ((res.data.files || []).length > 0) {
        setSelectedFile(res.data.files[0]);
      }
    } catch (e) {
      console.error('Failed to load archive files', e);
    } finally {
      setFilesLoading(false);
    }
  };

  useEffect(() => {
    const loadTable = async () => {
      if (!selectedFile) return;
      try {
        setTableLoading(true);
        const res = await api.get('/api/analytics/table', { params: { file: selectedFile, limit: 10 } });
        setTablePreview({
          columns: res.data.columns || [],
          rows: res.data.rows || [],
          total_rows: res.data.total_rows || 0,
        });
      } catch (e) {
        console.error('Failed to load table preview', e);
        setTablePreview({ columns: [], rows: [], total_rows: 0 });
      } finally {
        setTableLoading(false);
      }
    };
    loadTable();
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile) {
      setPlotLoading(true);
    }
  }, [selectedFile, plotKind, plotColumn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/stock', formData);
      setShowForm(false);
      setFormData({
        product_id: '',
        location: 'Main Warehouse',
        quantity_on_hand: ''
      });
      fetchData();
      alert('Stock updated successfully!');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStockStatus = (quantity, reorderPoint) => {
    if (quantity <= 0) return { status: 'out', color: '#e74c3c', text: 'Out of Stock' };
    if (quantity <= reorderPoint) return { status: 'low', color: '#f39c12', text: 'Low Stock' };
    return { status: 'good', color: '#27ae60', text: 'In Stock' };
  };

  if (loading) {
    return (
    <>
      {<LoadingIndicator />}
      <div className="products-container">
        <div className="loading">
        Loading products...
        <p>SPARK(AITS) made with love by KML🥰</p>
        </div>
      </div>
    </>
    );
  }

  const apiBase = import.meta.env.VITE_API_URL;
  const plotUrl = selectedFile
    ? `${apiBase}/api/analytics/plot?file=${encodeURIComponent(selectedFile)}&kind=${encodeURIComponent(plotKind)}${plotColumn ? `&column=${encodeURIComponent(plotColumn)}` : ''}`
    : '';

  return (
    <div className="stock-wrapper">
      <Navbar />
      <div className="stock-container">
        <div className="stock-header">
        <h1>Stock Management</h1>
        { user.role === "storemanager" && (
        <button 
          className="update-stock-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Update Stock'}
        </button>
        )}

      </div>

      {showForm && user.role === "storemanager" && (
        <div className="stock-form-container">
          <form onSubmit={handleSubmit} className="stock-form">
            <h2>Update Stock Level</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Product *</label>
                <select
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Quantity on Hand *</label>
                <input
                  type="number"
                  name="quantity_on_hand"
                  value={formData.quantity_on_hand}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">Update Stock</button>
              <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="stock-summary">
        <div className="summary-card">
          <h3>Total Products</h3>
          <span className="summary-number">{stockLevels.length}</span>
        </div>
        <div className="summary-card">
          <h3>In Stock</h3>
          <span className="summary-number">
            {stockLevels.filter(stock => stock.quantity_on_hand > 0).length}
          </span>
        </div>
        <div className="summary-card">
          <h3>Low Stock</h3>
          <span className="summary-number">
            {stockLevels.filter(stock => stock.quantity_on_hand <= 10).length}
          </span>
        </div>
        <div className="summary-card">
          <h3>Out of Stock</h3>
          <span className="summary-number">
            {stockLevels.filter(stock => stock.quantity_on_hand <= 0).length}
          </span>
        </div>
      </div>

      <div className="stock-grid">
        {stockLevels.length === 0 ? (
          <div className="no-stock">
            <p>No stock levels found. Update stock for your products!</p>
          </div>
        ) : (
          stockLevels.map(stock => {
            const stockStatus = getStockStatus(stock.quantity_on_hand, 10);
            return (
              <div key={stock.id} className="stock-card">
                <div className="stock-header-card">
                  <h3>{stock.product}</h3>
                  <span className="sku">SKU: {stock.sku}</span>
                </div>
                <div className="stock-details">
                  <div className="quantity-section">
                    <div className="quantity-display">
                      <span className="quantity-label">Quantity:</span>
                      <span className="quantity-value">{stock.quantity_on_hand}</span>
                    </div>
                    <div 
                      className="stock-status"
                      style={{ backgroundColor: stockStatus.color }}
                    >
                      {stockStatus.text}
                    </div>
                  </div>
                  <div className="location-info">
                    <span className="location-label">Location:</span>
                    <span className="location-value">{stock.location}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Analytics Panel */}
      <div className="analytics-panel" style={{ marginTop: '2rem' }}>
        <h2>Archive Analytics</h2>
        <div className="analytics-controls" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label>
            File:&nbsp;
            {filesLoading ? (
              <span className="muted">Loading files...</span>
            ) : (
              <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
                {files.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            )}
          </label>
          <label>
            Plot:&nbsp;
            <select value={plotKind} onChange={(e) => setPlotKind(e.target.value)}>
              <option value="bar">Bar (Top categories)</option>
              <option value="hist">Histogram (numeric)</option>
              <option value="line">Line (numeric)</option>
            </select>
          </label>
          <label>
            Column (optional):&nbsp;
            <input value={plotColumn} onChange={(e) => setPlotColumn(e.target.value)} placeholder="auto" />
          </label>
          <button type="button" className="toggle-btn" onClick={() => setShowTable((v) => !v)}>
            {showTable ? 'Hide Table' : 'Show Table'}
          </button>
        </div>

        {/* Grid layout to avoid overflow */}
        <div className="analytics-grid">
          {showTable && (
            <div className="analytics-card">
              <h3 className="section-title">Preview ({tablePreview.total_rows ?? 0} rows total)</h3>
              <div className="analytics-table-wrap">
                {tableLoading ? (
                  <LoadingIndicator />
                ) : tablePreview.columns.length > 0 ? (
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        {tablePreview.columns.map((c) => (
                          <th key={c}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tablePreview.rows.map((r, idx) => (
                        <tr key={idx}>
                          {tablePreview.columns.map((c) => (
                            <td key={c}>{String(r[c] ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="muted">No preview available.</div>
                )}
              </div>
            </div>
          )}

          <div className="analytics-card">
            <h3 className="section-title">Graph</h3>
            {selectedFile && (
              <div className="analytics-plot">
                {plotLoading && <LoadingIndicator />}
                <img
                  key={`${selectedFile}-${plotKind}-${plotColumn}`}
                  src={plotUrl}
                  alt="analytics plot"
                  onLoad={() => setPlotLoading(false)}
                  onError={() => setPlotLoading(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Stock;
