import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import DashboardView from './components/DashboardView';
import CategoryManager from './components/CategoryManager';
import ProductManager from './components/ProductManager';
import BillingPOSView from './components/BillingPOSView';
import BillTemplateViewer from './components/BillTemplateViewer';
import InvoiceHistoryView from './components/InvoiceHistoryView';
import SettingsView from './components/SettingsView';
import ToastNotification from './components/ToastNotification';
import LoginView from './components/LoginView';

import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  FileText,
  Sparkles,
  Settings,
  Receipt,
  Plus,
  LogOut,
  User,
  Shield,
  Sun,
  Moon,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('novabill_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('novabill_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };


  const [settings, setSettings] = useState({
    business_name: 'Novabill Enterprises',
    legal_name: 'Novabill Solutions Pvt Ltd',
    tagline: 'Smart Billing & Inventory Suite',
    phone: '+91 98765 43210',
    email: 'billing@novabill.io',
    website: 'www.novabill.io',
    address: '404 Tech Park, Indiranagar, Bengaluru, KA 560038',
    gstin: '29AABCN8511K1Z2',
    currency_symbol: '₹',
    currency_code: 'INR',
    invoice_prefix: 'INV',
    default_terms: 'Goods once sold will not be returned without original bill.',
    default_notes: 'Thank you for choosing Novabill! We appreciate your business.',
  });

  const [toast, setToast] = useState(null);
  const [previewBill, setPreviewBill] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showcaseBill, setShowcaseBill] = useState(null);

  const notify = (msgObj) => {
    setToast(msgObj);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Check auth session on startup
  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const res = await api.getCurrentUser();
          setCurrentUser(res.user);
        } catch (err) {
          api.clearAuth();
          setCurrentUser(null);
        }
      }
      setCheckingAuth(false);
    };
    initAuth();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.data) setSettings(res.data);
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const loadLatestBillForShowcase = async () => {
    try {
      const res = await api.getBills({ limit: 1 });
      if (res.data && res.data.length > 0) {
        const full = await api.getBill(res.data[0].id);
        setShowcaseBill(full.data);
      }
    } catch (err) {
      console.error('Failed to load bill for showcase', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadSettings();
      loadLatestBillForShowcase();
    }
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    notify({ type: 'info', message: 'You have been safely signed out.' });
  };

  const handleInvoiceGenerated = (newBill) => {
    setPreviewBill(newBill);
    setShowPreviewModal(true);
    setShowcaseBill(newBill);
  };

  const handlePreviewExisting = (bill) => {
    setPreviewBill(bill);
    setShowPreviewModal(true);
  };

  const currencySymbol = settings.currency_symbol || '₹';

  // Auth Loading Screen
  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
          <p style={{ fontSize: 13 }}>Initializing secure session...</p>
        </div>
      </div>
    );
  }

  // If not logged in, render Login Screen
  if (!currentUser) {
    return (
      <>
        <ToastNotification toast={toast} onClose={() => setToast(null)} />
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onNotify={notify}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </>
    );
  }

  // Main Authenticated Application Shell
  return (
    <div className="app-layout">
      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Sidebar Navigation */}
      <aside className="app-sidebar no-print">
        <div className="brand-header">
          <div className="brand-icon-box">
            <Receipt size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="brand-title">Novabill</span>
              <span className="brand-badge">PRO</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Smart Billing Engine</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            id="nav-dashboard"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className={`nav-item ${activeTab === 'pos' ? 'active' : ''}`}
            id="nav-pos"
          >
            <ShoppingBag size={18} />
            <span>Create Bill / POS</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            id="nav-products"
          >
            <Package size={18} />
            <span>Products Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            id="nav-categories"
          >
            <Layers size={18} />
            <span>Categories CRUD</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`nav-item ${activeTab === 'invoices' ? 'active' : ''}`}
            id="nav-invoices"
          >
            <FileText size={18} />
            <span>Invoices History</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`nav-item ${activeTab === 'templates' ? 'active' : ''}`}
            id="nav-templates"
          >
            <Sparkles size={18} />
            <span>Bill Templates</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            id="nav-settings"
          >
            <Settings size={18} />
            <span>Store Settings</span>
          </button>
        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: '#34d399' }}>
                  <Shield size={10} />
                  <span style={{ textTransform: 'capitalize' }}>{currentUser.role || 'Admin'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-icon btn-ghost"
              style={{ color: '#f87171', width: 30, height: 30 }}
              title="Sign Out"
              id="btn-logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="app-main">
        {/* Top Header */}
        <header className="top-bar no-print">
          <div className="page-headline">
            <h1>
              {activeTab === 'dashboard' && 'Business Intelligence Dashboard'}
              {activeTab === 'pos' && 'Point of Sale & Invoicing'}
              {activeTab === 'products' && 'Product Inventory Catalog'}
              {activeTab === 'categories' && 'Product Categories Management'}
              {activeTab === 'invoices' && 'Invoices Archive & Settlement'}
              {activeTab === 'templates' && 'Interactive Bill Templates Showcase'}
              {activeTab === 'settings' && 'Business Profile & Policy Configuration'}
            </h1>
            <p>
              {activeTab === 'dashboard' && 'Real-time overview of revenue, sales, and catalog status'}
              {activeTab === 'pos' && 'Fast barcode/search item selection and instant checkout'}
              {activeTab === 'products' && 'Create, edit, adjust stock, and manage product rates'}
              {activeTab === 'categories' && 'Classification taxonomy with custom color tags and tax rates'}
              {activeTab === 'invoices' && 'Review all past bills, track payments, or reprint'}
              {activeTab === 'templates' && 'Switch between Modern, Classic GST, 80mm Thermal, and Minimal styles'}
              {activeTab === 'settings' && 'Customize your invoice header, tax registration, and terms'}
            </p>
          </div>

          <div className="top-actions">
            {activeTab !== 'pos' && (
              <button onClick={() => setActiveTab('pos')} className="btn btn-primary btn-sm">
                <Plus size={15} />
                New Bill
              </button>
            )}

            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={`Switch to ${theme === 'dark' ? 'White / Light' : 'Black / Dark'} Theme`}
              id="btn-toggle-theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={15} style={{ color: '#f59e0b' }} />
                  <span>White Theme</span>
                </>
              ) : (
                <>
                  <Moon size={15} style={{ color: '#6366f1' }} />
                  <span>Black Theme</span>
                </>
              )}
            </button>

            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              Currency: <strong>{currencySymbol}</strong>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              title="Sign Out"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="content-container">
          {activeTab === 'dashboard' && (
            <DashboardView
              currencySymbol={currencySymbol}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectBillForPreview={handlePreviewExisting}
              onNotify={notify}
            />
          )}

          {activeTab === 'pos' && (
            <BillingPOSView
              currencySymbol={currencySymbol}
              settings={settings}
              onNotify={notify}
              onInvoiceGenerated={handleInvoiceGenerated}
              onRefreshCatalog={loadLatestBillForShowcase}
            />
          )}

          {activeTab === 'products' && (
            <ProductManager
              currencySymbol={currencySymbol}
              onNotify={notify}
              onRefreshCatalog={loadLatestBillForShowcase}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryManager
              onNotify={notify}
              onRefreshCatalog={loadLatestBillForShowcase}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoiceHistoryView
              currencySymbol={currencySymbol}
              onNotify={notify}
              onSelectBillForPreview={handlePreviewExisting}
            />
          )}

          {activeTab === 'templates' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#fff' }}>
                  Live Bill Template Engine
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Preview how your customer bills look across 4 standard professional layouts. Click <strong>Print</strong> to test print output!
                </p>
              </div>

              {showcaseBill ? (
                <BillTemplateViewer
                  bill={showcaseBill}
                  settings={settings}
                  canClose={false}
                />
              ) : (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p>No bills found to showcase. Create your first bill in POS!</p>
                  <button onClick={() => setActiveTab('pos')} className="btn btn-primary" style={{ marginTop: 12 }}>
                    Go to POS
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSettingsUpdated={(newSettings) => setSettings(newSettings)}
              onNotify={notify}
            />
          )}
        </div>
      </main>

      {/* Bill Preview Modal */}
      {showPreviewModal && previewBill && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPreviewModal(false);
          }}
        >
          <div
            className="modal-content"
            style={{ maxWidth: 880, maxHeight: '95vh', padding: 12, background: 'var(--bg-secondary)' }}
          >
            <BillTemplateViewer
              bill={previewBill}
              settings={settings}
              canClose={true}
              onClose={() => setShowPreviewModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
