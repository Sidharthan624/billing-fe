import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Search, Plus, Trash2, ShoppingCart, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function BillingPOSView({
  currencySymbol = '₹',
  settings = {},
  onNotify,
  onInvoiceGenerated,
  onRefreshCatalog,
}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [billNumber, setBillNumber] = useState('');

  const [customer, setCustomer] = useState({
    name: 'Walk-in Customer',
    phone: '',
    email: '',
    address: '',
    gstin: '',
  });
  const [showMoreCustomer, setShowMoreCustomer] = useState(false);

  const [billItems, setBillItems] = useState([]);
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [deductStock, setDeductStock] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customItem, setCustomItem] = useState({
    item_name: '',
    unit_price: 100,
    quantity: 1,
    tax_rate: 18,
    unit: 'pcs',
  });

  const fetchData = async () => {
    setLoadingProducts(true);
    try {
      const [catsRes, prodsRes] = await Promise.all([
        api.getCategories(),
        api.getProducts({ isActive: true }),
      ]);
      setCategories(catsRes.data || []);
      setProducts(prodsRes.data || []);
    } catch (err) {
      onNotify({ type: 'error', message: 'Failed to load POS catalog' });
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchNextBillNumber = async () => {
    try {
      const res = await api.getNextBillNumber();
      setBillNumber(res.billNumber);
    } catch (err) {
      console.error('Failed to get next invoice number', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchNextBillNumber();
  }, []);

  const formatPrice = (val) => {
    return parseFloat(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const filteredProducts = useMemo(() => {
    let prods = products;
    if (selectedCategoryId) {
      prods = prods.filter((p) => p.category_id === selectedCategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }
    return prods;
  }, [products, selectedCategoryId, searchQuery]);

  // Compute live calculations
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;

    billItems.forEach((item) => {
      const qty = parseFloat(item.quantity) || 1;
      const rate = parseFloat(item.unit_price) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;
      const discRate = parseFloat(item.discount_rate) || 0;

      const base = qty * rate;
      const disc = base * (discRate / 100);
      const taxable = Math.max(0, base - disc);
      const tax = taxable * (taxRate / 100);

      subtotal += taxable;
      totalTax += tax;
    });

    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = subtotal * ((parseFloat(discountValue) || 0) / 100);
    } else {
      discountAmount = Math.min(subtotal, parseFloat(discountValue) || 0);
    }

    const preRound = (subtotal - discountAmount) + totalTax;
    const roundedGrandTotal = Math.round(preRound);
    const roundOff = parseFloat((roundedGrandTotal - preRound).toFixed(2));

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      taxAmount: parseFloat(totalTax.toFixed(2)),
      roundOff: roundOff,
      grandTotal: roundedGrandTotal,
    };
  }, [billItems, discountType, discountValue]);

  const addProductToBill = (prod) => {
    setBillItems((prev) => {
      const index = prev.findIndex((i) => i.product_id === prod.id);
      const taxRate = parseFloat(prod.tax_rate) || 0;
      const unitPrice = parseFloat(prod.price) || 0;

      if (index !== -1) {
        const copy = [...prev];
        const newQty = copy[index].quantity + 1;
        const total = (newQty * unitPrice) * (1 + taxRate / 100);
        copy[index] = { ...copy[index], quantity: newQty, total: parseFloat(total.toFixed(2)) };
        return copy;
      } else {
        const total = unitPrice * (1 + taxRate / 100);
        return [
          ...prev,
          {
            product_id: prod.id,
            item_name: prod.name,
            sku: prod.sku,
            quantity: 1,
            unit: prod.unit || 'pcs',
            unit_price: unitPrice,
            tax_rate: taxRate,
            discount_rate: 0,
            total: parseFloat(total.toFixed(2)),
          },
        ];
      }
    });
  };

  const updateQty = (index, delta) => {
    setBillItems((prev) => {
      const copy = [...prev];
      const item = copy[index];
      if (!item) return prev;
      const newQty = Math.max(1, (item.quantity || 1) + delta);
      const rate = parseFloat(item.unit_price) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;
      const total = (newQty * rate) * (1 + taxRate / 100);
      copy[index] = { ...item, quantity: newQty, total: parseFloat(total.toFixed(2)) };
      return copy;
    });
  };

  const removeItem = (index) => {
    setBillItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addCustomItem = (e) => {
    e.preventDefault();
    if (!customItem.item_name.trim()) return;

    const taxRate = parseFloat(customItem.tax_rate) || 0;
    const unitPrice = parseFloat(customItem.unit_price) || 0;
    const qty = parseFloat(customItem.quantity) || 1;
    const total = (qty * unitPrice) * (1 + taxRate / 100);

    setBillItems((prev) => [
      ...prev,
      {
        product_id: null,
        item_name: customItem.item_name.trim(),
        sku: 'CUSTOM',
        quantity: qty,
        unit: customItem.unit || 'pcs',
        unit_price: unitPrice,
        tax_rate: taxRate,
        discount_rate: 0,
        total: parseFloat(total.toFixed(2)),
      },
    ]);

    setShowCustomModal(false);
  };

  const resetBill = () => {
    setBillItems([]);
    setCustomer({
      name: 'Walk-in Customer',
      phone: '',
      email: '',
      address: '',
      gstin: '',
    });
    setDiscountValue(0);
    fetchNextBillNumber();
  };

  const generateBill = async () => {
    if (billItems.length === 0) {
      onNotify({ type: 'error', message: 'Add at least one item to bill' });
      return;
    }
    if (!customer.name.trim()) {
      onNotify({ type: 'error', message: 'Customer name is required' });
      return;
    }

    setGenerating(true);
    try {
      const payload = {
        bill_number: billNumber,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        customer_address: customer.address,
        customer_gstin: customer.gstin,
        items: billItems,
        discount_type: discountType,
        discount_value: discountValue,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        deduct_stock: deductStock,
      };

      const res = await api.createBill(payload);
      onNotify({ type: 'success', message: 'Invoice generated successfully!' });
      if (onInvoiceGenerated) onInvoiceGenerated(res.data);
      resetBill();
      fetchData(); // refresh stock numbers
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err) {
      onNotify({ type: 'error', message: err.message || 'Failed to generate invoice' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(360px, 0.85fr)', gap: 24, alignItems: 'start' }}>
      {/* LEFT: Product Catalog */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="glass-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search products by name, SKU or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: 38 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            <button
              onClick={() => setSelectedCategoryId(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                border: '1px solid var(--border-subtle)',
                background: selectedCategoryId === null ? 'var(--accent-primary-light)' : 'rgba(255,255,255,0.03)',
                color: selectedCategoryId === null ? '#a5b4fc' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid var(--border-subtle)',
                  background: selectedCategoryId === cat.id ? 'var(--accent-primary-light)' : 'rgba(255,255,255,0.03)',
                  color: selectedCategoryId === cat.id ? '#a5b4fc' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: cat.color || '#6366f1' }} />
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loadingProducts ? (
          <div style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ width: 28, height: 28, border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
            <p>Loading items...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', paddingRight: 4 }}>
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="glass-card"
                onClick={() => prod.stock_quantity > 0 && addProductToBill(prod)}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  cursor: prod.stock_quantity > 0 ? 'pointer' : 'not-allowed',
                  opacity: prod.stock_quantity > 0 ? 1 : 0.55,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{prod.sku}</span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: '1px 6px',
                      borderRadius: 999,
                      background:
                        prod.stock_quantity > 10
                          ? 'rgba(16, 185, 129, 0.15)'
                          : prod.stock_quantity > 0
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                      color:
                        prod.stock_quantity > 10
                          ? '#34d399'
                          : prod.stock_quantity > 0
                          ? '#fbbf24'
                          : '#f87171',
                    }}
                  >
                    {prod.stock_quantity} {prod.unit || 'pcs'}
                  </span>
                </div>

                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {prod.name}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{currencySymbol}{formatPrice(prod.price)}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{prod.tax_rate}% Tax</div>
                  </div>
                  <button
                    disabled={prod.stock_quantity <= 0}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: 'var(--accent-primary)',
                      color: 'white',
                      border: 'none',
                      fontSize: 16,
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No products match your search.</p>
          </div>
        )}
      </div>

      {/* RIGHT: Active Bill Cart */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 88 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent-primary)' }}>NEW INVOICE</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{billNumber || 'INV-...'}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setShowCustomModal(true)} className="btn btn-secondary btn-sm">
                + Custom Item
              </button>
              <button onClick={resetBill} className="btn btn-ghost btn-sm">
                Clear
              </button>
            </div>
          </div>

          {/* Customer Details */}
          <div style={{ padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Customer Details
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Customer Name *"
                className="form-control"
                style={{ padding: '7px 10px', fontSize: 12.5, marginBottom: 8 }}
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                className="form-control"
                style={{ padding: '7px 10px', fontSize: 12.5, marginBottom: 8 }}
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />
            </div>
            {showMoreCustomer && (
              <>
                <div className="form-row">
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="form-control"
                    style={{ padding: '7px 10px', fontSize: 12.5, marginBottom: 8 }}
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Customer GSTIN"
                    className="form-control"
                    style={{ padding: '7px 10px', fontSize: 12.5, marginBottom: 8 }}
                    value={customer.gstin}
                    onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Billing / Delivery Address"
                  className="form-control"
                  style={{ padding: '7px 10px', fontSize: 12.5, marginBottom: 8 }}
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                />
              </>
            )}
            <button
              type="button"
              onClick={() => setShowMoreCustomer(!showMoreCustomer)}
              style={{ background: 'transparent', border: 'none', color: '#818cf8', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              {showMoreCustomer ? '▴ Less Customer Info' : '▾ More Info (Email, GSTIN, Address)'}
            </button>
          </div>

          {/* Line items list */}
          <div style={{ maxHeight: 240, overflowY: 'auto', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Items ({billItems.length})
            </div>

            {billItems.length === 0 ? (
              <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <ShoppingCart size={32} style={{ opacity: 0.5 }} />
                <p style={{ fontSize: 13, margin: 0 }}>No items added yet</p>
                <span style={{ fontSize: 11 }}>Click items on the left catalog to start</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {billItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.item_name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 6 }}>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{item.sku}</span>
                        <span>Tax: {item.tax_rate}%</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-card)', borderRadius: 6, background: 'var(--bg-input)' }}>
                      <button
                        onClick={() => updateQty(index, -1)}
                        style={{ width: 22, height: 24, background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        -
                      </button>
                      <span style={{ width: 28, textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(index, 1)}
                        style={{ width: 22, height: 24, background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: 65 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{currencySymbol}{formatPrice(item.total)}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>@ {currencySymbol}{formatPrice(item.unit_price)}</div>
                    </div>

                    <button
                      onClick={() => removeItem(index)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calculations & Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>{currencySymbol}{formatPrice(totals.subtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: '#34d399' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Discount:</span>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  style={{ padding: '2px 4px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 4, fontSize: 11 }}
                >
                  <option value="percentage">%</option>
                  <option value="flat">{currencySymbol}</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  style={{ width: 50, padding: '2px 4px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 4, fontSize: 11 }}
                />
              </div>
              <span>-{currencySymbol}{formatPrice(totals.discountAmount)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-secondary)' }}>
              <span>Tax (GST/VAT)</span>
              <span>{currencySymbol}{formatPrice(totals.taxAmount)}</span>
            </div>

            {totals.roundOff !== 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                <span>Round Off</span>
                <span>{totals.roundOff > 0 ? '+' : ''}{currencySymbol}{totals.roundOff}</span>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
              border: '1px solid rgba(99,102,241,0.4)',
              borderRadius: 10,
              marginTop: 4
            }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#c7d2fe', display: 'block' }}>Grand Total</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{billItems.length} item(s)</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#fff' }}>
                {currencySymbol}{formatPrice(totals.grandTotal)}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-control"
                  style={{ padding: '6px 8px', fontSize: 12 }}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / QR</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Status:</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="form-control"
                  style={{ padding: '6px 8px', fontSize: 12 }}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Partially Paid">Partially Paid</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={deductStock}
                  onChange={(e) => setDeductStock(e.target.checked)}
                />
                <span>Auto-deduct items from inventory stock</span>
              </label>
            </div>

            <button
              onClick={generateBill}
              disabled={billItems.length === 0 || generating}
              className="btn btn-primary"
              id="btn-generate-bill"
              style={{ width: '100%', padding: 12, fontSize: 14, marginTop: 6 }}
            >
              <Check size={18} />
              {generating ? 'Generating Invoice...' : 'Generate & Print Invoice'}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Item Modal */}
      {showCustomModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCustomModal(false); }}>
          <div className="modal-content" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Custom Line Item</h3>
              <button onClick={() => setShowCustomModal(false)} className="btn-icon btn-ghost">✕</button>
            </div>
            <form onSubmit={addCustomItem}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Item / Service Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Express Delivery, Custom Consultation"
                    value={customItem.item_name}
                    onChange={(e) => setCustomItem({ ...customItem, item_name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Unit Price ({currencySymbol}) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      value={customItem.unit_price}
                      onChange={(e) => setCustomItem({ ...customItem, unit_price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={customItem.quantity}
                      onChange={(e) => setCustomItem({ ...customItem, quantity: parseInt(e.target.value, 10) || 1 })}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className="form-control"
                      value={customItem.tax_rate}
                      onChange={(e) => setCustomItem({ ...customItem, tax_rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="pcs, hrs, job"
                      value={customItem.unit}
                      onChange={(e) => setCustomItem({ ...customItem, unit: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCustomModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add to Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
