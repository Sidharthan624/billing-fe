import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, Search, Package, AlertCircle } from 'lucide-react';

export default function ProductManager({ currencySymbol = '₹', onNotify, onRefreshCatalog }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    stockTab: 'all',
  });

  const [form, setForm] = useState({
    id: null,
    name: '',
    sku: '',
    category_id: null,
    price: '',
    cost_price: '',
    tax_rate: 18,
    stock_quantity: 20,
    unit: 'pcs',
    barcode: '',
    description: '',
    is_active: true,
  });

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        search: filters.search,
        categoryId: filters.categoryId,
      };
      const res = await api.getProducts(params);
      setProducts(res.data || []);
    } catch (err) {
      onNotify({ type: 'error', message: err.message || 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [filters.search, filters.categoryId]);

  const openCreateModal = () => {
    setIsEditing(false);
    setForm({
      id: null,
      name: '',
      sku: '',
      category_id: categories[0]?.id || null,
      price: '',
      cost_price: '',
      tax_rate: categories[0]?.tax_rate || 18,
      stock_quantity: 25,
      unit: 'pcs',
      barcode: '',
      description: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (prod) => {
    setIsEditing(true);
    setForm({
      id: prod.id,
      name: prod.name,
      sku: prod.sku,
      category_id: prod.category_id,
      price: parseFloat(prod.price),
      cost_price: parseFloat(prod.cost_price || 0),
      tax_rate: parseFloat(prod.tax_rate || 0),
      stock_quantity: parseInt(prod.stock_quantity, 10) || 0,
      unit: prod.unit || 'pcs',
      barcode: prod.barcode || '',
      description: prod.description || '',
      is_active: prod.is_active,
    });
    setShowModal(true);
  };

  const onCategoryChange = (catId) => {
    const selected = categories.find((c) => c.id === parseInt(catId, 10));
    setForm((prev) => ({
      ...prev,
      category_id: catId ? parseInt(catId, 10) : null,
      tax_rate: selected?.tax_rate !== undefined ? parseFloat(selected.tax_rate) : prev.tax_rate,
    }));
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.updateProduct(form.id, form);
        onNotify({ type: 'success', message: 'Product updated successfully' });
      } else {
        await api.createProduct(form);
        onNotify({ type: 'success', message: 'Product created successfully' });
      }
      setShowModal(false);
      await fetchProducts();
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err) {
      onNotify({ type: 'error', message: err.message || 'Operation failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const adjustStock = async (prod, delta) => {
    try {
      const res = await api.adjustProductStock(prod.id, delta);
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, stock_quantity: res.data.stock_quantity } : p))
      );
      onNotify({
        type: 'info',
        message: `Stock for ${prod.name}: ${res.data.stock_quantity} ${prod.unit}`,
      });
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err) {
      onNotify({ type: 'error', message: 'Failed to adjust stock' });
    }
  };

  const confirmDelete = (prod) => {
    setProductToDelete(prod);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    setSubmitting(true);
    try {
      await api.deleteProduct(productToDelete.id);
      onNotify({ type: 'success', message: 'Product removed from catalog' });
      setShowDeleteModal(false);
      setProductToDelete(null);
      await fetchProducts();
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err) {
      onNotify({ type: 'error', message: err.message || 'Failed to delete product' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (val) => {
    return parseFloat(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const lowStockCount = products.filter((p) => p.stock_quantity <= 10).length;
  const filteredProducts =
    filters.stockTab === 'low'
      ? products.filter((p) => p.stock_quantity <= 10)
      : products;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Product Catalog
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Manage inventory items, SKUs, sales rates, stock levels, and tax rates
          </p>
        </div>
        <div>
          <button onClick={openCreateModal} className="btn btn-primary" id="btn-create-product">
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by product name, SKU or barcode..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="form-control"
            style={{ paddingLeft: 38 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>Category:</span>
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              className="form-control"
              style={{ minWidth: 160 }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: 3, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setFilters({ ...filters, stockTab: 'all' })}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                background: filters.stockTab === 'all' ? 'var(--bg-card-hover)' : 'transparent',
                color: filters.stockTab === 'all' ? '#fff' : 'var(--text-muted)',
              }}
            >
              All Items ({products.length})
            </button>
            <button
              onClick={() => setFilters({ ...filters, stockTab: 'low' })}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                background: filters.stockTab === 'low' ? 'var(--bg-card-hover)' : 'transparent',
                color: filters.stockTab === 'low' ? '#fff' : 'var(--text-muted)',
              }}
            >
              Low Stock ({lowStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p>Loading products...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item / SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Tax Rate</th>
                  <th>Inventory Stock</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 15,
                            backgroundColor: `${prod.category_color || '#6366f1'}22`,
                            color: prod.category_color || '#6366f1',
                            flexShrink: 0,
                          }}
                        >
                          {prod.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                            {prod.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#a5b4fc', background: 'rgba(99,102,241,0.1)', padding: '1px 5px', borderRadius: 4 }}>
                              {prod.sku}
                            </span>
                            {prod.barcode && (
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                #{prod.barcode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {prod.category_name ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 9px',
                            borderRadius: 999,
                            fontSize: 11.5,
                            fontWeight: 600,
                            backgroundColor: `${prod.category_color || '#6366f1'}20`,
                            color: prod.category_color || '#818cf8',
                            border: `1px solid ${prod.category_color || '#6366f1'}40`,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: prod.category_color || '#6366f1' }} />
                          {prod.category_name}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>
                        {currencySymbol}{formatPrice(prod.price)}
                      </div>
                      {prod.cost_price > 0 && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Cost: {currencySymbol}{formatPrice(prod.cost_price)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4, color: 'var(--text-secondary)' }}>
                        {prod.tax_rate}%
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '3px 9px',
                            borderRadius: 999,
                            minWidth: 64,
                            textAlign: 'center',
                            background:
                              prod.stock_quantity > 10
                                ? 'var(--color-success-bg)'
                                : prod.stock_quantity > 0
                                ? 'var(--color-warning-bg)'
                                : 'var(--color-danger-bg)',
                            color:
                              prod.stock_quantity > 10
                                ? '#34d399'
                                : prod.stock_quantity > 0
                                ? '#fbbf24'
                                : '#f87171',
                            border: `1px solid ${
                              prod.stock_quantity > 10
                                ? 'rgba(16, 185, 129, 0.3)'
                                : prod.stock_quantity > 0
                                ? 'rgba(245, 158, 11, 0.3)'
                                : 'rgba(239, 68, 68, 0.3)'
                            }`,
                          }}
                        >
                          {prod.stock_quantity} {prod.unit || 'pcs'}
                        </span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          <button
                            onClick={() => adjustStock(prod, -1)}
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 4,
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                              fontSize: 12,
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Decrease stock"
                          >
                            -
                          </button>
                          <button
                            onClick={() => adjustStock(prod, 1)}
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 4,
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                              fontSize: 12,
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Increase stock"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--text-muted)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: prod.is_active ? '#10b981' : '#64748b', boxShadow: prod.is_active ? '0 0 8px rgba(16,185,129,0.6)' : 'none' }} />
                        {prod.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                        <button onClick={() => openEditModal(prod)} className="btn-icon btn-ghost" title="Edit Product">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => confirmDelete(prod)} className="btn-icon btn-ghost" style={{ color: '#f87171' }} title="Delete Product">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3>No products found</h3>
          <p>No products match the selected filters or search query.</p>
          <button onClick={openCreateModal} className="btn btn-primary btn-sm" style={{ marginTop: 10 }}>
            Add New Product
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-content" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h3 className="modal-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon btn-ghost">✕</button>
            </div>
            <form onSubmit={saveProduct}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Wireless ANC Headphones"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">SKU / Item Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Auto-generated if empty (e.g. PRD-0001)"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Leave blank to auto-generate</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={form.category_id || ''}
                      onChange={(e) => onCategoryChange(e.target.value)}
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} (Tax: {cat.tax_rate}%)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Selling Price ({currencySymbol}) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      placeholder="0.00"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cost / Purchase Price ({currencySymbol})</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      placeholder="0.00"
                      value={form.cost_price}
                      onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className="form-control"
                      placeholder="18"
                      value={form.tax_rate}
                      onChange={(e) => setForm({ ...form, tax_rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Initial Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="0"
                      value={form.stock_quantity}
                      onChange={(e) => setForm({ ...form, stock_quantity: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select
                      className="form-control"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    >
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="litre">Litres (litre)</option>
                      <option value="box">Box (box)</option>
                      <option value="pack">Pack (pack)</option>
                      <option value="meter">Meters (meter)</option>
                      <option value="set">Set (set)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Barcode / UPC</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Scan or enter barcode"
                      value={form.barcode}
                      onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Features</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Product specifications, warranty details, etc."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginTop: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    <span>Product is Active and Available for Billing</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div className="modal-content" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#fca5a5' }}>Delete Product</h3>
              <button onClick={() => setShowDeleteModal(false)} className="btn-icon btn-ghost">✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to permanently delete <strong>{productToDelete?.name}</strong> (SKU: {productToDelete?.sku})?</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Existing generated invoices containing this item will keep their line item history.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={executeDelete} className="btn btn-danger" disabled={submitting}>
                {submitting ? 'Deleting...' : 'Yes, Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
