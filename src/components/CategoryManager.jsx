import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, Search, AlertTriangle, Layers, Tag } from 'lucide-react';

const PRESET_COLORS = [
  '#6366f1', '#10b981', '#ec4899', '#f59e0b',
  '#06b6d4', '#8b5cf6', '#3b82f6', '#ef4444'
];

export default function CategoryManager({ onNotify, onRefreshCatalog }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    color: '#6366f1',
    tax_rate: 18,
    is_active: true,
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      setCategories(res.data || []);
    } catch (err) {
      onNotify({ type: 'error', message: err.message || 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setForm({
      id: null,
      name: '',
      description: '',
      color: '#6366f1',
      tax_rate: 18,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setIsEditing(true);
    setForm({
      id: cat.id,
      name: cat.name,
      description: cat.description || '',
      color: cat.color || '#6366f1',
      tax_rate: parseFloat(cat.tax_rate) || 0,
      is_active: cat.is_active,
    });
    setShowModal(true);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.updateCategory(form.id, form);
        onNotify({ type: 'success', message: 'Category updated successfully' });
      } else {
        await api.createCategory(form);
        onNotify({ type: 'success', message: 'Category created successfully' });
      }
      setShowModal(false);
      await fetchCategories();
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err) {
      onNotify({ type: 'error', message: err.message || 'Operation failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (cat) => {
    setCategoryToDelete(cat);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!categoryToDelete) return;
    setSubmitting(true);
    try {
      const force = (categoryToDelete.product_count || 0) > 0;
      await api.deleteCategory(categoryToDelete.id, force);
      onNotify({ type: 'success', message: 'Category deleted successfully' });
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      await fetchCategories();
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err) {
      onNotify({ type: 'error', message: err.message || 'Failed to delete category' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Product Categories
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Organize inventory into clear classification, tax rates, and visual badges
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: 36, width: 240 }}
            />
          </div>
          <button onClick={openCreateModal} className="btn btn-primary" id="btn-create-category">
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* Grid or Empty */}
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p>Loading categories...</p>
        </div>
      ) : filteredCategories.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="glass-card"
              style={{
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                padding: 22,
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: cat.color || '#6366f1' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 999,
                  fontSize: 11.5,
                  fontWeight: 600,
                  backgroundColor: `${cat.color || '#6366f1'}22`,
                  color: cat.color || '#6366f1'
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: cat.color || '#6366f1' }} />
                  Tax {cat.tax_rate}%
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openEditModal(cat)} className="btn-icon btn-ghost" title="Edit Category">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => confirmDelete(cat)} className="btn-icon btn-ghost" style={{ color: '#f87171' }} title="Delete Category">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                {cat.name}
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 20, flex: 1 }}>
                {cat.description || 'No description provided'}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                  <Layers size={14} />
                  <span><strong>{cat.product_count || 0}</strong> products</span>
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 999,
                  backgroundColor: cat.is_active ? 'var(--color-success-bg)' : 'rgba(255,255,255,0.05)',
                  color: cat.is_active ? '#34d399' : 'var(--text-muted)'
                }}>
                  {cat.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Tag size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3>No categories found</h3>
          <p>Try a different search query or create a new category</p>
          <button onClick={openCreateModal} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
            Add Category
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{isEditing ? 'Edit Category' : 'Create New Category'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon btn-ghost">✕</button>
            </div>
            <form onSubmit={saveCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Organic Beverages, Tech Accessories"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Brief description of products belonging to this category..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Default Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className="form-control"
                      value={form.tax_rate}
                      onChange={(e) => setForm({ ...form, tax_rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Color Accent</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="color"
                        value={form.color}
                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                        style={{ width: 44, height: 38, border: '1px solid var(--border-card)', borderRadius: 6, background: 'transparent', cursor: 'pointer' }}
                      />
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {PRESET_COLORS.map((c) => (
                          <span
                            key={c}
                            onClick={() => setForm({ ...form, color: c })}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: c,
                              cursor: 'pointer',
                              border: form.color === c ? '2px solid #fff' : '2px solid transparent',
                              transform: form.color === c ? 'scale(1.15)' : 'none'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    <span>Category is Active (visible in product catalogs & billing)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div className="modal-content" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#fca5a5' }}>Confirm Category Deletion</h3>
              <button onClick={() => setShowDeleteModal(false)} className="btn-icon btn-ghost">✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete category <strong>{categoryToDelete?.name}</strong>?</p>
              {categoryToDelete?.product_count > 0 && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  color: '#fbbf24',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  marginTop: 14
                }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Warning:</strong> This category has <strong>{categoryToDelete.product_count}</strong> product(s) linked to it.
                    Deleting it will unlink these products and leave them unassigned.
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={executeDelete} className="btn btn-danger" disabled={submitting}>
                {submitting ? 'Deleting...' : 'Yes, Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
