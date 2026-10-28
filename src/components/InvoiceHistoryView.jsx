import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Eye, Trash2, FileText, CheckCircle, Clock } from 'lucide-react';

export default function InvoiceHistoryView({
  currencySymbol = '₹',
  onNotify,
  onSelectBillForPreview,
}) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        paymentStatus: statusFilter !== 'All' ? statusFilter : undefined,
      };
      const res = await api.getBills(params);
      setBills(res.data || []);
    } catch (err) {
      onNotify({ type: 'error', message: 'Failed to load invoices' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBills();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const viewBillDetails = async (billId) => {
    try {
      const res = await api.getBill(billId);
      if (onSelectBillForPreview) {
        onSelectBillForPreview(res.data);
      }
    } catch (err) {
      onNotify({ type: 'error', message: 'Failed to load invoice details' });
    }
  };

  const confirmDelete = (bill) => {
    setBillToDelete(bill);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!billToDelete) return;
    setDeleting(true);
    try {
      await api.deleteBill(billToDelete.id);
      onNotify({ type: 'success', message: 'Invoice deleted successfully' });
      setShowDeleteModal(false);
      setBillToDelete(null);
      fetchBills();
    } catch (err) {
      onNotify({ type: 'error', message: err.message || 'Failed to delete invoice' });
    } finally {
      setDeleting(false);
    }
  };

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Invoices & Billing History
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Search past customer bills, reprint in any format, or track payment settlements
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search invoice number or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
            style={{ paddingLeft: 38 }}
          />
        </div>

        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: 3, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
          {['All', 'Paid', 'Pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                background: statusFilter === st ? 'var(--bg-card-hover)' : 'transparent',
                color: statusFilter === st ? '#fff' : 'var(--text-muted)',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bills Table */}
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p>Loading invoices...</p>
        </div>
      ) : bills.length > 0 ? (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Payment Status</th>
                  <th>Payment Mode</th>
                  <th style={{ textAlign: 'right' }}>Grand Total</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: '#a5b4fc' }}>
                          {bill.bill_number}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          ({bill.items_count || 1} items)
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {formatDate(bill.bill_date)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13.5 }}>
                        {bill.customer_name}
                      </div>
                      {bill.customer_phone && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{bill.customer_phone}</div>
                      )}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: bill.payment_status === 'Paid' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                          color: bill.payment_status === 'Paid' ? '#34d399' : '#fbbf24',
                          border: `1px solid ${bill.payment_status === 'Paid' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                        }}
                      >
                        {bill.payment_status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {bill.payment_method || 'Cash'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-primary)' }}>
                        {currencySymbol}{formatPrice(bill.grand_total)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          onClick={() => viewBillDetails(bill.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px', fontSize: 12 }}
                          title="View / Print Invoice"
                        >
                          <Eye size={14} />
                          Preview
                        </button>
                        <button
                          onClick={() => confirmDelete(bill)}
                          className="btn-icon btn-ghost"
                          style={{ color: '#f87171' }}
                          title="Delete Invoice"
                        >
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
          <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3>No invoices found</h3>
          <p>No billing invoices match your current filter.</p>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div className="modal-content" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#fca5a5' }}>Delete Invoice Record</h3>
              <button onClick={() => setShowDeleteModal(false)} className="btn-icon btn-ghost">✕</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete invoice <strong>{billToDelete?.bill_number}</strong> for{' '}
                <strong>{billToDelete?.customer_name}</strong>?
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                This record will be permanently deleted from the database.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={executeDelete} className="btn btn-danger" disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
