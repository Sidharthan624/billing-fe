import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DollarSign, FileText, Package, AlertTriangle, ArrowUpRight, Plus, Eye, ShoppingBag } from 'lucide-react';

export default function DashboardView({
  currencySymbol = '₹',
  onNavigate,
  onSelectBillForPreview,
  onNotify,
}) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatPrice = (val) => {
    return parseFloat(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const openBill = async (billId) => {
    try {
      const res = await api.getBill(billId);
      if (onSelectBillForPreview) onSelectBillForPreview(res.data);
    } catch (err) {
      onNotify({ type: 'error', message: 'Failed to load bill' });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p>Loading dashboard metrics...</p>
      </div>
    );
  }

  const revenue = stats?.revenue || {};
  const products = stats?.products || {};
  const categories = stats?.categories || {};
  const recentBills = stats?.recentBills || [];
  const lowStock = stats?.lowStockProducts || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Welcome Banner */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
        }}
      >
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#818cf8', textTransform: 'uppercase' }}>
            Overview & Telemetry
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            Novabill Smart Billing Suite
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Manage category CRUD, product catalog, real-time inventory and multi-format bill templates
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onNavigate('pos')} className="btn btn-primary" id="btn-quick-bill">
            <ShoppingBag size={16} />
            Create Bill
          </button>
          <button onClick={() => onNavigate('products')} className="btn btn-secondary">
            <Package size={16} />
            Manage Products
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        {/* Total Revenue */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL REVENUE</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
            {currencySymbol}{formatPrice(revenue.total_revenue)}
          </div>
          <div style={{ fontSize: 11.5, color: '#34d399', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Settled: {currencySymbol}{formatPrice(revenue.paid_revenue)}</span>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>INVOICES ISSUED</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
            {revenue.total_bills || 0}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
            Total billed transactions
          </div>
        </div>

        {/* Catalog Items */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>ACTIVE PRODUCTS</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
            {products.total_products || 0}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
            Across {categories.total_categories || 0} categories
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>LOW STOCK ITEMS</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: products.low_stock_count > 0 ? '#fbbf24' : '#fff' }}>
            {products.low_stock_count || 0}
          </div>
          <div style={{ fontSize: 11.5, color: products.low_stock_count > 0 ? '#fbbf24' : 'var(--text-muted)', marginTop: 4 }}>
            {products.low_stock_count > 0 ? 'Requires replenishment' : 'All stocks healthy'}
          </div>
        </div>
      </div>

      {/* Split section: Recent Bills & Low Stock alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
        {/* Recent Invoices Table */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Invoices
            </h3>
            <button onClick={() => onNavigate('invoices')} className="btn btn-ghost btn-sm">
              View All Invoices →
            </button>
          </div>

          {recentBills.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No invoices generated yet.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBills.map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#a5b4fc' }}>
                        {b.bill_number}
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {b.customer_name}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: b.payment_status === 'Paid' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                            color: b.payment_status === 'Paid' ? '#34d399' : '#fbbf24',
                          }}
                        >
                          {b.payment_status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {currencySymbol}{formatPrice(b.grand_total)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => openBill(b.id)} className="btn-icon btn-ghost" title="Preview Bill">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Watchlist */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Low Stock Watchlist
            </h3>
            <button onClick={() => onNavigate('products')} className="btn btn-ghost btn-sm">
              Manage Catalog →
            </button>
          </div>

          {lowStock.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              🎉 All product stocks are well above minimum thresholds.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lowStock.map((prod) => (
                <div
                  key={prod.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{prod.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{prod.sku}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#fbbf24',
                      }}
                    >
                      {prod.stock_quantity} {prod.unit || 'pcs'} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
