import React, { useState, useEffect , useContext } from 'react';
import api from '../../api';
import Navbar from '../Navbar/Navbar';
import LoadingIndicator from '../LoadingIndicator.jsx';
import './Products.css';
import { AuthContext } from '../../AuthContext.jsx';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    cost_price: '',
    sell_price: '',
    reorder_point: '',
    reorder_qty: ''
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
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState({ columns: [], dtypes: {}, numeric_columns: [], summary: {}, top_values: {} });
  const [showTable, setShowTable] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchArchiveFiles();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
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
      await api.post('/api/products', formData);
      setShowForm(false);
      setFormData({
        sku: '',
        name: '',
        cost_price: '',
        sell_price: '',
        reorder_point: '',
        reorder_qty: ''
      });
      fetchProducts();
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
    <div className="products-wrapper">
      <Navbar />
      <div className="products-container">
        <div className="products-header">
        <h1>Product Management</h1>
        { user.role === "storemanager" && (
        <button 
          className="add-product-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
        )
        }
      </div>

      {showForm && user.role === "storemanager" && (
        <div className="product-form-container">
          <form onSubmit={handleSubmit} className="product-form">
            <h2>Add New Product</h2>
            <div className="form-row">
              <div className="form-group">
                <label>SKU *</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Cost Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Sell Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="sell_price"
                  value={formData.sell_price}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Reorder Point</label>
                <input
                  type="number"
                  name="reorder_point"
                  value={formData.reorder_point}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Reorder Quantity</label>
                <input
                  type="number"
                  name="reorder_qty"
                  value={formData.reorder_qty}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">Add Product</button>
              <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-grid">
        {products.length === 0 ? (
          <div className="no-products">
            <p>No products found. Add your first product!</p>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <h3>{product.name}</h3>
                <span className="sku">SKU: {product.sku}</span>
              </div>
              <div className="product-details">
                <div className="price-info">
                  <div className="price-item">
                    <span className="label">Cost Price:</span>
                    <span className="value">${product.cost_price}</span>
                  </div>
                  <div className="price-item">
                    <span className="label">Sell Price:</span>
                    <span className="value">${product.sell_price}</span>
                  </div>
                </div>
                <div className="reorder-info">
                  <div className="reorder-item">
                    <span className="label">Reorder Point:</span>
                    <span className="value">{product.reorder_point}</span>
                  </div>
                  <div className="reorder-item">
                    <span className="label">Reorder Qty:</span>
                    <span className="value">{product.reorder_qty}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
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

        {/* Grid: Table and Plot side-by-side on wide screens */}
        <div className="analytics-grid">
          {/* Table Preview (Collapsible) */}
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

          {/* Plot */}
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

        {/* Summary Tables */}
        <div className="analytics-table-wrap">
          {summaryLoading ? (
            <LoadingIndicator />
          ) : summary.columns.length > 0 ? (
            <>
              <h3>Schema</h3>
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.columns.map((c) => (
                    <tr key={c}>
                      <td>{c}</td>
                      <td>{summary.dtypes[c]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {summary.numeric_columns.length > 0 && (
                <>
                  <h3 style={{ marginTop: '1rem' }}>Numeric Summary</h3>
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        <th>Stat</th>
                        {summary.numeric_columns.map((c) => (
                          <th key={c}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(summary.summary).length > 0 && (
                        Object.keys(summary.summary[summary.numeric_columns[0]] || {}).map((statKey) => (
                          <tr key={statKey}>
                            <td>{statKey}</td>
                            {summary.numeric_columns.map((c) => (
                              <td key={c + statKey}>{String(summary.summary[c]?.[statKey] ?? '')}</td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </>
              )}

              {Object.keys(summary.top_values).length > 0 && (
                <>
                  <h3 style={{ marginTop: '1rem' }}>Top Values</h3>
                  {Object.entries(summary.top_values).map(([col, mapping]) => (
                    <div key={col} style={{ marginBottom: '0.75rem' }}>
                      <strong>{col}</strong>
                      <table className="analytics-table" style={{ marginTop: '0.5rem' }}>
                        <thead>
                          <tr>
                            <th>Value</th>
                            <th>Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(mapping).map(([val, count]) => (
                            <tr key={String(val)}>
                              <td>{String(val)}</td>
                              <td>{String(count)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Products;
