import React, { useState } from 'react';
import { Printer, X } from 'lucide-react';

export default function BillTemplateViewer({
  bill,
  settings = {},
  canClose = true,
  initialTemplate = 'modern',
  onClose,
}) {
  const [currentTemplate, setCurrentTemplate] = useState(initialTemplate);

  const currencySymbol = settings.currency_symbol || '₹';

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

  const printBill = () => {
    window.print();
  };

  if (!bill) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Controls Bar (Hidden during print) */}
      <div className="glass-card no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Template:</span>
          <div style={{ display: 'flex', gap: 6, background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 10, border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentTemplate('modern')}
              style={{
                padding: '7px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: currentTemplate === 'modern' ? 'var(--accent-primary)' : 'transparent',
                color: currentTemplate === 'modern' ? '#fff' : 'var(--text-muted)',
              }}
            >
              ✨ Modern Corporate
            </button>
            <button
              onClick={() => setCurrentTemplate('classic')}
              style={{
                padding: '7px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: currentTemplate === 'classic' ? 'var(--accent-primary)' : 'transparent',
                color: currentTemplate === 'classic' ? '#fff' : 'var(--text-muted)',
              }}
            >
              🏛️ Classic Tax/GST
            </button>
            <button
              onClick={() => setCurrentTemplate('pos')}
              style={{
                padding: '7px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: currentTemplate === 'pos' ? 'var(--accent-primary)' : 'transparent',
                color: currentTemplate === 'pos' ? '#fff' : 'var(--text-muted)',
              }}
            >
              🧾 Thermal POS (80mm)
            </button>
            <button
              onClick={() => setCurrentTemplate('slate')}
              style={{
                padding: '7px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: currentTemplate === 'slate' ? 'var(--accent-primary)' : 'transparent',
                color: currentTemplate === 'slate' ? '#fff' : 'var(--text-muted)',
              }}
            >
              🖤 Minimal Slate
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={printBill} className="btn btn-primary" id="btn-print-invoice">
            <Printer size={16} />
            Print / Save PDF
          </button>
          {canClose && onClose && (
            <button onClick={onClose} className="btn btn-secondary">
              <X size={16} />
              Close Preview
            </button>
          )}
        </div>
      </div>

      {/* Printable Area */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        {/* =========================================================
            TEMPLATE 1: MODERN CORPORATE
            ========================================================= */}
        {currentTemplate === 'modern' && (
          <div className="paper modern-template print-area" style={{ background: '#ffffff', color: '#1e293b', width: '100%', maxWidth: 820, minHeight: 1050, padding: 48, borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 24, borderBottom: '2px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24 }}>
                  {(settings.business_name || 'N').charAt(0)}
                </div>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {settings.business_name || 'Novabill Enterprises'}
                  </h1>
                  <p style={{ fontSize: 13, color: '#64748b' }}>
                    {settings.tagline || 'Smart Billing & Inventory Suite'}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', background: '#ede9fe', color: '#6d28d9', padding: '4px 10px', borderRadius: 999, display: 'inline-block', marginBottom: 6 }}>
                  TAX INVOICE
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: '#1e1b4b' }}>
                  {bill.bill_number}
                </div>
                <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
                  Date: <strong>{formatDate(bill.bill_date)}</strong>
                </div>
                {bill.due_date && (
                  <div style={{ fontSize: 12.5, color: '#64748b' }}>
                    Due: <strong>{formatDate(bill.due_date)}</strong>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, margin: '28px 0' }}>
              <div style={{ padding: '16px 20px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#6366f1', marginBottom: 6 }}>FROM</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{settings.legal_name || settings.business_name}</div>
                <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>{settings.address}</div>
                <div style={{ fontSize: 12.5, color: '#475569' }}>Phone: {settings.phone}</div>
                <div style={{ fontSize: 12.5, color: '#475569' }}>Email: {settings.email}</div>
                <div style={{ fontSize: 12.5, color: '#475569' }}><strong>GSTIN:</strong> {settings.gstin}</div>
              </div>

              <div style={{ padding: '16px 20px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#6366f1', marginBottom: 6 }}>BILLED TO</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{bill.customer_name}</div>
                {bill.customer_address && <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>{bill.customer_address}</div>}
                {bill.customer_phone && <div style={{ fontSize: 12.5, color: '#475569' }}>Phone: {bill.customer_phone}</div>}
                {bill.customer_email && <div style={{ fontSize: 12.5, color: '#475569' }}>Email: {bill.customer_email}</div>}
                {bill.customer_gstin && <div style={{ fontSize: 12.5, color: '#475569' }}><strong>GSTIN:</strong> {bill.customer_gstin}</div>}
              </div>
            </div>

            {/* Line items table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 28 }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#fff', textAlign: 'left', fontSize: 11.5 }}>
                  <th style={{ padding: '12px 16px', borderTopLeftRadius: 8, width: 40 }}>#</th>
                  <th style={{ padding: '12px 16px' }}>Item & Description</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Tax %</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', borderTopRightRadius: 8 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bill.items?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 1 ? '#fcfdfe' : '#fff' }}>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#334155' }}>{idx + 1}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.item_name}</div>
                      {item.sku && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#64748b' }}>SKU: {item.sku}</div>}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, textAlign: 'center', color: '#334155' }}>{item.quantity} {item.unit || 'pcs'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, textAlign: 'right', color: '#334155' }}>{currencySymbol}{formatPrice(item.unit_price)}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, textAlign: 'right', color: '#334155' }}>{item.tax_rate}%</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{currencySymbol}{formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals & Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, marginBottom: 36 }}>
              <div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 16px', borderRadius: 10, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Payment Info</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                    <span>Status:</span>
                    <strong style={{ color: bill.payment_status === 'Paid' ? '#059669' : '#d97706' }}>{bill.payment_status}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                    <span>Payment Mode:</span>
                    <strong>{bill.payment_method || 'Cash'}</strong>
                  </div>
                </div>

                {bill.notes && (
                  <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.5, marginTop: 10 }}>
                    <strong style={{ color: '#334155', display: 'block', marginBottom: 2 }}>Notes:</strong>
                    <p>{bill.notes}</p>
                  </div>
                )}

                <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.5, marginTop: 10 }}>
                  <strong style={{ color: '#334155', display: 'block', marginBottom: 2 }}>Terms & Conditions:</strong>
                  <p>{bill.terms || settings.default_terms}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', padding: '4px 0' }}>
                  <span>Subtotal:</span>
                  <span>{currencySymbol}{formatPrice(bill.subtotal)}</span>
                </div>
                {bill.discount_amount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#10b981', fontWeight: 600, padding: '4px 0' }}>
                    <span>Discount ({bill.discount_value}{bill.discount_type === 'percentage' ? '%' : ''}):</span>
                    <span>-{currencySymbol}{formatPrice(bill.discount_amount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', padding: '4px 0' }}>
                  <span>Tax Total (GST/VAT):</span>
                  <span>{currencySymbol}{formatPrice(bill.tax_amount)}</span>
                </div>
                {bill.shipping_charges > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', padding: '4px 0' }}>
                    <span>Shipping:</span>
                    <span>{currencySymbol}{formatPrice(bill.shipping_charges)}</span>
                  </div>
                )}
                {bill.round_off !== 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', padding: '4px 0' }}>
                    <span>Round Off:</span>
                    <span>{bill.round_off > 0 ? '+' : ''}{currencySymbol}{bill.round_off}</span>
                  </div>
                )}

                <div style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff', padding: '16px 20px', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: 15, marginTop: 12, boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}>
                  <span>Grand Total</span>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>{currencySymbol}{formatPrice(bill.grand_total)}</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
              <div>This is a computer generated invoice and requires no physical signature.</div>
              <div>{settings.website || 'www.novabill.io'}</div>
            </div>
          </div>
        )}

        {/* =========================================================
            TEMPLATE 2: CLASSIC TAX / GST INVOICE
            ========================================================= */}
        {currentTemplate === 'classic' && (
          <div className="paper classic-template print-area" style={{ background: '#ffffff', color: '#000', width: '100%', maxWidth: 820, padding: 36, borderRadius: 16 }}>
            <div style={{ border: '2px solid #000' }}>
              <div style={{ textAlign: 'center', borderBottom: '1.5px solid #000', padding: 8, background: '#f8fafc' }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.05em', color: '#000', margin: 0 }}>TAX INVOICE</h2>
                <div style={{ fontSize: 11, fontWeight: 600 }}>(Original for Recipient)</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', borderBottom: '1.5px solid #000' }}>
                <div style={{ padding: '12px 14px', fontSize: 12, borderRight: '1.5px solid #000', lineHeight: 1.4 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{settings.legal_name || settings.business_name}</div>
                  <div>{settings.address}</div>
                  <div>Phone: {settings.phone} | Email: {settings.email}</div>
                  <div><strong>GSTIN:</strong> {settings.gstin}</div>
                </div>
                <div style={{ padding: '12px 14px', fontSize: 12, lineHeight: 1.5 }}>
                  <div><strong>Invoice No:</strong> {bill.bill_number}</div>
                  <div><strong>Invoice Date:</strong> {formatDate(bill.bill_date)}</div>
                  {bill.due_date && <div><strong>Due Date:</strong> {formatDate(bill.due_date)}</div>}
                  <div><strong>Place of Supply:</strong> Local</div>
                </div>
              </div>

              <div style={{ padding: '10px 14px', borderBottom: '1.5px solid #000', background: '#fafafa', fontSize: 12 }}>
                <div style={{ fontSize: 11, textDecoration: 'underline', fontWeight: 600, marginBottom: 4 }}>Details of Receiver (Billed To):</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{bill.customer_name}</div>
                {bill.customer_address && <div>Address: {bill.customer_address}</div>}
                {bill.customer_phone && <div>Phone: {bill.customer_phone}</div>}
                {bill.customer_gstin && <div><strong>GSTIN / UIN:</strong> {bill.customer_gstin}</div>}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', fontSize: 11.5 }}>
                    <th style={{ border: '1px solid #000', padding: 8 }}>S.No</th>
                    <th style={{ border: '1px solid #000', padding: 8, textAlign: 'left' }}>Description</th>
                    <th style={{ border: '1px solid #000', padding: 8 }}>HSN/SKU</th>
                    <th style={{ border: '1px solid #000', padding: 8 }}>Qty</th>
                    <th style={{ border: '1px solid #000', padding: 8, textAlign: 'right' }}>Rate</th>
                    <th style={{ border: '1px solid #000', padding: 8, textAlign: 'right' }}>Tax %</th>
                    <th style={{ border: '1px solid #000', padding: 8, textAlign: 'right' }}>Tax Amt</th>
                    <th style={{ border: '1px solid #000', padding: 8, textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items?.map((item, idx) => (
                    <tr key={idx} style={{ fontSize: 12 }}>
                      <td style={{ border: '1px solid #000', padding: 8, textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ border: '1px solid #000', padding: 8 }}><strong>{item.item_name}</strong></td>
                      <td style={{ border: '1px solid #000', padding: 8, textAlign: 'center' }}>{item.sku || '-'}</td>
                      <td style={{ border: '1px solid #000', padding: 8, textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                      <td style={{ border: '1px solid #000', padding: 8, textAlign: 'right' }}>{formatPrice(item.unit_price)}</td>
                      <td style={{ border: '1px solid #000', padding: 8, textAlign: 'right' }}>{item.tax_rate}%</td>
                      <td style={{ border: '1px solid #000', padding: 8, textAlign: 'right' }}>{formatPrice(item.tax_amount)}</td>
                      <td style={{ border: '1px solid #000', padding: 8, textAlign: 'right' }}><strong>{formatPrice(item.total)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000' }}>
                <div style={{ padding: 12, borderRight: '1.5px solid #000', fontSize: 12 }}>
                  <div><strong>Payment Mode:</strong> {bill.payment_method} ({bill.payment_status})</div>
                  <div style={{ marginTop: 14, fontSize: 11 }}>
                    <div style={{ fontWeight: 700 }}>Terms & Conditions:</div>
                    <div>{bill.terms || settings.default_terms}</div>
                  </div>
                </div>

                <div style={{ padding: '10px 14px', fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span>Taxable Value:</span>
                    <span>{currencySymbol}{formatPrice(bill.subtotal)}</span>
                  </div>
                  {bill.discount_amount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                      <span>Discount:</span>
                      <span>-{currencySymbol}{formatPrice(bill.discount_amount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span>Total Tax:</span>
                    <span>{currencySymbol}{formatPrice(bill.tax_amount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000', padding: '8px 0', fontSize: 14, marginTop: 4 }}>
                    <span><strong>Total Invoice Value:</strong></span>
                    <span><strong>{currencySymbol}{formatPrice(bill.grand_total)}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: 16, fontSize: 12 }}>
                <div>Customer Signature</div>
                <div style={{ textAlign: 'right' }}>
                  <div>For <strong>{settings.business_name}</strong></div>
                  <div style={{ height: 44 }} />
                  <div>Authorized Signatory</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TEMPLATE 3: THERMAL POS RECEIPT (80mm)
            ========================================================= */}
        {currentTemplate === 'pos' && (
          <div className="paper pos-template print-area" style={{ background: '#ffffff', color: '#000', width: '100%', maxWidth: 360, padding: '24px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{settings.business_name}</h2>
              <div style={{ fontSize: 11, color: '#333' }}>{settings.address}</div>
              <div style={{ fontSize: 11, color: '#333' }}>Tel: {settings.phone}</div>
              <div style={{ fontSize: 11, color: '#333' }}>GSTIN: {settings.gstin}</div>
            </div>

            <div style={{ textAlign: 'center', margin: '6px 0', fontSize: 11 }}>------------------------------------------</div>

            <div style={{ fontSize: 11.5, lineHeight: 1.4 }}>
              <div>BILL NO: {bill.bill_number}</div>
              <div>DATE: {formatDate(bill.bill_date)}</div>
              <div>CUST: {bill.customer_name}</div>
              {bill.customer_phone && <div>PH: {bill.customer_phone}</div>}
            </div>

            <div style={{ textAlign: 'center', margin: '6px 0', fontSize: 11 }}>------------------------------------------</div>

            <table style={{ width: '100%', fontSize: 11.5, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px dashed #000', textAlign: 'left' }}>
                  <th>ITEM</th>
                  <th style={{ textAlign: 'center' }}>QTY</th>
                  <th style={{ textAlign: 'right' }}>RATE</th>
                  <th style={{ textAlign: 'right' }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {bill.items?.map((item, idx) => (
                  <tr key={idx} style={{ padding: '4px 0' }}>
                    <td>
                      <div>{item.item_name}</div>
                      {item.tax_rate > 0 && <small style={{ color: '#555' }}>T:{item.tax_rate}%</small>}
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{formatPrice(item.unit_price)}</td>
                    <td style={{ textAlign: 'right' }}>{formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'center', margin: '6px 0', fontSize: 11 }}>------------------------------------------</div>

            <div style={{ fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span>SUBTOTAL:</span>
                <span>{currencySymbol}{formatPrice(bill.subtotal)}</span>
              </div>
              {bill.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>DISCOUNT:</span>
                  <span>-{currencySymbol}{formatPrice(bill.discount_amount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span>TAX:</span>
                <span>{currencySymbol}{formatPrice(bill.tax_amount)}</span>
              </div>
              <div style={{ textAlign: 'center', margin: '4px 0', fontSize: 11 }}>==========================================</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800 }}>
                <span>TOTAL AMOUNT:</span>
                <span>{currencySymbol}{formatPrice(bill.grand_total)}</span>
              </div>
              <div style={{ textAlign: 'center', margin: '4px 0', fontSize: 11 }}>==========================================</div>
            </div>

            <div style={{ margin: '10px 0', textAlign: 'center', fontSize: 11 }}>
              <div>MODE: {bill.payment_method} | STATUS: {bill.payment_status}</div>
              <div>ITEMS COUNT: {bill.items?.length || 0}</div>
            </div>

            <div style={{ textAlign: 'center', margin: '14px 0' }}>
              <div style={{ letterSpacing: 2, fontSize: 16 }}>|||||||||||||||||||||||||||||||||||||||||||||</div>
              <div style={{ fontSize: 11 }}>{bill.bill_number}</div>
            </div>

            <div style={{ textAlign: 'center', fontSize: 11, color: '#333', lineHeight: 1.4 }}>
              <div>{settings.default_notes || 'Thank you for your visit!'}</div>
              <div>Please retain this receipt for warranty/exchange.</div>
            </div>
          </div>
        )}

        {/* =========================================================
            TEMPLATE 4: MINIMAL SLATE
            ========================================================= */}
        {currentTemplate === 'slate' && (
          <div className="paper slate-template print-area" style={{ background: '#ffffff', color: '#0f172a', width: '100%', maxWidth: 820, minHeight: 950, padding: 48, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 24, borderBottom: '4px solid #0f172a' }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.15em', color: '#0f172a' }}>INVOICE</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 800 }}>{bill.bill_number}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{settings.business_name}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{formatDate(bill.bill_date)}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, margin: '32px 0' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 6 }}>ISSUED BY</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{settings.legal_name || settings.business_name}</div>
                <div style={{ fontSize: 13, color: '#475569' }}>{settings.address}</div>
                <div style={{ fontSize: 13, color: '#475569' }}>GSTIN: {settings.gstin}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 6 }}>ISSUED TO</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{bill.customer_name}</div>
                <div style={{ fontSize: 13, color: '#475569' }}>{bill.customer_address || 'No address specified'}</div>
                <div style={{ fontSize: 13, color: '#475569' }}>{bill.customer_phone}</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 32 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #0f172a', textAlign: 'left', fontSize: 12 }}>
                  <th style={{ padding: '12px 14px' }}>Description</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Rate</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Tax</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bill.items?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', fontSize: 13.5 }}>
                    <td style={{ padding: '16px 14px' }}>
                      <div style={{ fontWeight: 600 }}>{item.item_name}</div>
                      {item.sku && <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>SKU: {item.sku}</div>}
                    </td>
                    <td style={{ padding: '16px 14px', textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                    <td style={{ padding: '16px 14px', textAlign: 'right' }}>{currencySymbol}{formatPrice(item.unit_price)}</td>
                    <td style={{ padding: '16px 14px', textAlign: 'right' }}>{item.tax_rate}%</td>
                    <td style={{ padding: '16px 14px', textAlign: 'right', fontWeight: 700 }}>{currencySymbol}{formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8' }}>PAYMENT & STATUS</div>
                <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 4, background: '#f1f5f9', fontSize: 12, fontWeight: 600, margin: '6px 0' }}>
                  {bill.payment_status} via {bill.payment_method}
                </div>
                {bill.notes && <p style={{ fontSize: 12, color: '#64748b' }}>{bill.notes}</p>}
              </div>

              <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', color: '#475569' }}>
                  <span>Subtotal</span>
                  <span>{currencySymbol}{formatPrice(bill.subtotal)}</span>
                </div>
                {bill.discount_amount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', color: '#475569' }}>
                    <span>Discount</span>
                    <span>-{currencySymbol}{formatPrice(bill.discount_amount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', color: '#475569' }}>
                  <span>Tax (GST)</span>
                  <span>{currencySymbol}{formatPrice(bill.tax_amount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', marginTop: 8, paddingTop: 10, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  <span>Total Due</span>
                  <span>{currencySymbol}{formatPrice(bill.grand_total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
