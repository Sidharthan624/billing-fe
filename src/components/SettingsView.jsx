import React, { useState } from 'react';
import { api } from '../services/api';
import { Save, Building, FileCheck } from 'lucide-react';

export default function SettingsView({ settings, onSettingsUpdated, onNotify }) {
  const [form, setForm] = useState({
    business_name: settings.business_name || '',
    legal_name: settings.legal_name || '',
    tagline: settings.tagline || '',
    phone: settings.phone || '',
    email: settings.email || '',
    website: settings.website || '',
    address: settings.address || '',
    gstin: settings.gstin || '',
    currency_symbol: settings.currency_symbol || '₹',
    currency_code: settings.currency_code || 'INR',
    invoice_prefix: settings.invoice_prefix || 'INV',
    default_terms: settings.default_terms || '',
    default_notes: settings.default_notes || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateSettings(form);
      onNotify({ type: 'success', message: 'Business settings updated successfully!' });
      if (onSettingsUpdated) onSettingsUpdated(res.data);
    } catch (err) {
      onNotify({ type: 'error', message: err.message || 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 840, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
          Business Profile & Invoice Settings
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Update store details, tax registration number, currency, and default invoice policies
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Company Identity */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
            <Building size={18} style={{ color: 'var(--accent-primary)' }} />
            Company Identification
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Brand / Store Display Name *</label>
              <input
                type="text"
                className="form-control"
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Legal Registered Entity Name</label>
              <input
                type="text"
                className="form-control"
                value={form.legal_name}
                onChange={(e) => setForm({ ...form, legal_name: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tagline / Slogan</label>
              <input
                type="text"
                className="form-control"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">GSTIN / Tax ID / VAT Number</label>
              <input
                type="text"
                className="form-control"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
            Contact & Address Details
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-control"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Official Email</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input
                type="text"
                className="form-control"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Registered Office / Store Address</label>
            <textarea
              className="form-control"
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </div>

        {/* Invoicing Preferences */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
            <FileCheck size={18} style={{ color: '#10b981' }} />
            Invoicing Preferences & Currency
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <select
                className="form-control"
                value={form.currency_symbol}
                onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })}
              >
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="$">$ (USD - US Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - British Pound)</option>
                <option value="AED">AED (UAE Dirham)</option>
                <option value="¥">¥ (JPY / CNY)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Invoice Number Prefix</label>
              <input
                type="text"
                className="form-control"
                value={form.invoice_prefix}
                onChange={(e) => setForm({ ...form, invoice_prefix: e.target.value.toUpperCase() })}
                placeholder="INV"
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>e.g. {form.invoice_prefix}-2026-0001</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Default Invoice Terms & Conditions</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.default_terms}
              onChange={(e) => setForm({ ...form, default_terms: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Default Invoice Footer Note</label>
            <input
              type="text"
              className="form-control"
              value={form.default_notes}
              onChange={(e) => setForm({ ...form, default_notes: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
