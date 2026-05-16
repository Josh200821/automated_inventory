import React, { useState, useEffect , useContext } from 'react';
import api from '../../api';
import Navbar from '../Navbar/Navbar';
import LoadingIndicator from '../LoadingIndicator.jsx';
import './Movements.css';
import { AuthContext } from '../../AuthContext.jsx';

const Movements = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    qty_change: '',
    movement_type: 'receipt',
    location: 'Main Warehouse'
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
      const [movementsResponse, productsResponse] = await Promise.all([
        api.get('/api/movements'),
        api.get('/api/products')
      ]);
      setMovements(movementsResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch movement data');
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
      await api.post('/api/movements', formData);
      setShowForm(false);
      setFormData({
        product_id: '',
        qty_change: '',
        movement_type: 'receipt',
        location: 'Main Warehouse'
      });
      fetchData();
      alert('Stock movement recorded successfully!');
    } catch (error) {
      console.error('Error recording movement:', error);
      alert('Failed to record movement');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'receipt': return '📦';
      case 'sale': return '💰';
      case 'adjustment': return '🔧';
      default: return '📊';
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'receipt': return '#27ae60';
      case 'sale': return '#e74c3c';
      case 'adjustment': return '#f39c12';
      default: return '#3498db';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
    <div className="movements-wrapper">
      <Navbar />
      <div className="movements-container">
        <div className="movements-header">
        <h1>Stock Movements</h1>
        { user.role === "storemanager" && (
        <button 
          className="add-movement-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Record Movement'}
        </button>
        )}

      </div>

      {showForm && user.role === "storemanager" && (
        <div className="movement-form-container">
          <form onSubmit={handleSubmit} className="movement-form">
            <h2>Record Stock Movement</h2>
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
                <label>Movement Type *</label>
                <select
                  name="movement_type"
                  value={formData.movement_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="receipt">Receipt (In)</option>
                  <option value="sale">Sale (Out)</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Quantity Change *</label>
                <input
                  type="number"
                  name="qty_change"
                  value={formData.qty_change}
                  onChange={handleInputChange}
                  required
                  placeholder="Use negative for outbound"
                />
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
            <div className="form-actions">
              <button type="submit" className="submit-btn">Record Movement</button>
              <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="movements-timeline">
        <h2>Recent Movements</h2>
        {movements.length === 0 ? (
          <div className="no-movements">
            <p>No movements recorded yet. Record your first stock movement!</p>
          </div>
        ) : (
          <div className="timeline">
            {movements.map(movement => (
              <div key={movement.id} className="timeline-item">
                <div className="timeline-marker">
                  <span 
                    className="movement-icon"
                    style={{ backgroundColor: getMovementColor(movement.movement_type) }}
                  >
                    {getMovementIcon(movement.movement_type)}
                  </span>
                </div>
                <div className="timeline-content">
                  <div className="movement-header">
                    <h3>{movement.product}</h3>
                    <span className="movement-type" style={{ color: getMovementColor(movement.movement_type) }}>
                      {movement.movement_type.toUpperCase()}
                    </span>
                  </div>
                  <div className="movement-details">
                    <div className="movement-info">
                      <span className="sku">SKU: {movement.sku}</span>
                      <span className="location">📍 {movement.location}</span>
                    </div>
                    <div className="quantity-change">
                      <span className={`qty-change ${movement.qty_change > 0 ? 'positive' : 'negative'}`}>
                        {movement.qty_change > 0 ? '+' : ''}{movement.qty_change}
                      </span>
                    </div>
                    <div className="movement-date">
                      {formatDate(movement.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

export default Movements;
