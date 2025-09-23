// components/InvoiceGenerator.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const InvoiceGenerator = ({ onClose, onCreated }) => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_ids: [],
    productsDetails: {},
    client: '',
    payment_method: 'cash',
    status: 'unpaid',
    noTaxInfo: false,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    if (!error && Array.isArray(data)) setProducts(data);
  };

  const selectedProducts = products.filter(p => form.product_ids.includes(String(p.id)));
  const totalAmount = selectedProducts.reduce((sum, prod) => {
    const details = form.productsDetails[prod.id] || {};
    const q = Number(details.quantity) || 0;
    const p = Number(details.price) || 0;
    return sum + q * p;
  }, 0);

  const isValid = form.product_ids.length > 0 &&
    form.product_ids.every(id => {
      const details = form.productsDetails[id] || {};
      return Number(details.quantity) > 0 && Number(details.price) > 0;
    }) &&
    form.client.trim().length > 0;

  const handleProductCheck = (id) => (e) => {
    const checked = e.target.checked;
    setForm(prev => {
      const ids = checked
        ? [...prev.product_ids, String(id)]
        : prev.product_ids.filter(pid => pid !== String(id));
      const newDetails = { ...prev.productsDetails };
      if (checked && !newDetails[id]) {
        const prod = products.find(p => String(p.id) === String(id));
        newDetails[id] = {
          quantity: 1,
          price: prod ? Number(prod.price) || 0 : 0
        };
      }
      if (!checked) {
        delete newDetails[id];
      }
      return {
        ...prev,
        product_ids: ids,
        productsDetails: newDetails
      };
    });
  };

  const handleProductDetailChange = (id, key) => (e) => {
    const raw = e.target.value;
    setForm(prev => ({
      ...prev,
      productsDetails: {
        ...prev.productsDetails,
        [id]: {
          ...prev.productsDetails[id],
          [key]: raw === '' ? '' : Number(raw)
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValid) {
      setError('Veuillez remplir tous les champs obligatoires correctement.');
      return;
    }
    // Validation stricte pour chaque produit
    for (const id of form.product_ids) {
      const details = form.productsDetails[id] || {};
      if (!details.quantity || !details.price || details.quantity <= 0 || details.price <= 0) {
        setError('La quantité et le prix doivent être renseignés et supérieurs à zéro pour chaque produit.');
        return;
      }
    }
    setSubmitting(true);
    try {
      const payload = {
        products: form.product_ids.map(id => ({
          id,
          quantity: Number(form.productsDetails[id]?.quantity),
          price: Number(form.productsDetails[id]?.price)
        })),
        client: form.client,
        payment_method: form.payment_method,
        status: form.status,
        total: totalAmount,
        notaxinfo: form.noTaxInfo,
      };
      const { error: dbError } = await supabase
        .from('sales')
        .insert([payload]);
      if (dbError) throw dbError;
      if (typeof onCreated === 'function') onCreated();
      if (typeof onClose === 'function') onClose();
    } catch (err) {
      setError(err?.message || 'Erreur lors de la création de la facture.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Générer une nouvelle facture</h2>
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Produits/Services</label>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {products.map(product => (
                <label key={product.id} style={{display:'flex',alignItems:'center',fontSize:'1em',color:'#222'}}>
                  <input
                    type="checkbox"
                    style={{width:'16px',height:'16px'}}
                    checked={form.product_ids.includes(String(product.id))}
                    onChange={handleProductCheck(product.id)}
                  />
                  <span style={{marginLeft:'8px'}}>{product.name} <span style={{color:'#228b22',fontWeight:'bold'}}>- {Number(product.price).toLocaleString()} FCFA</span></span>
                </label>
              ))}
            </div>
          </div>
          {form.product_ids.map((id, idx) => {
            const prod = products.find(p => String(p.id) === String(id));
            const details = form.productsDetails[id] || {};
            return (
              <div
                key={id}
                className="form-group invoice-product-group"
                style={{
                  borderRadius: '6px',
                  padding: '8px',
                  marginBottom: '8px',
                  background: undefined,
                }}>
                <strong className="invoice-product-label">{prod?.name || id}</strong>
                {/* Texte Quantité Prix unitaire (FCFA) visible en haut du groupe */}
                <div
                  className="invoice-product-header product-header-color"
                  style={{
                    margin: '8px 0 4px 0',
                    fontWeight: 'bold',
                    fontSize: '1.08em',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    width: 'fit-content'
                  }}>
                  Quantité&nbsp;&nbsp;Prix unitaire (FCFA)
                </div>
                <div style={{display:'flex',gap:'12px',marginTop:'6px'}}>
                  <div>
                    <label className="invoice-product-label">Quantité</label>
                    <input
                      type="number"
                      min="1"
                      value={details.quantity !== undefined ? details.quantity : 1}
                      onChange={handleProductDetailChange(id, 'quantity')}
                      required
                      className="invoice-product-input"
                      style={{width:'70px'}}
                    />
                  </div>
                  <div>
                    <label className="invoice-product-label">Prix unitaire (FCFA)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={details.price !== undefined ? details.price : prod?.price || 0}
                      onChange={handleProductDetailChange(id, 'price')}
                      required
                      className="invoice-product-input"
                      style={{width:'110px'}}
                    />
                  </div>
                  <div className="invoice-product-total" style={{marginLeft:'16px',fontWeight:'bold',color:'#228b22',alignSelf:'center'}}>
                    {(details.quantity && details.price) ? (details.quantity * details.price).toLocaleString() + ' FCFA' : ''}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="form-group">
            <label htmlFor="total">Total (FCFA)</label>
            <input id="total" type="text" value={totalAmount ? totalAmount.toLocaleString() : '0'} readOnly style={{fontWeight:'bold',color:'#228b22',background:'#f3fff3'}} />
          </div>
          <div className="form-group">
            <label htmlFor="client">Client</label>
            <input
              id="client"
              type="text"
              value={form.client}
              onChange={e => setForm(prev => ({ ...prev, client: e.target.value }))}
              required
            />
          </div>
          <div className="form-group" style={{background:'#e3f2fd',border:'2px solid #228b22',borderRadius:'8px',padding:'12px',margin:'16px 0'}}>
          </div>
          <div className="form-group">
            <label htmlFor="payment">Mode de paiement</label>
            <select
              id="payment"
              value={form.payment_method}
              onChange={e => setForm(prev => ({ ...prev, payment_method: e.target.value }))}
            >
              <option value="cash">Espèces</option>
              <option value="transfert">Virement</option>
              <option value="check">Chèque</option>
              <option value="mobile">Mobile Money</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status">Statut de la facture</label>
            <select
              id="status"
              value={form.status}
              onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="unpaid">Non payée ❌</option>
              <option value="paid">Payée ✅</option>
              <option value="proforma">Pro forma 📝</option>
            </select>
          </div>
          <div className="sale-summary">
            <h3>Résumé de la facture</h3>
            <ul>
              {form.product_ids.map(id => {
                const prod = products.find(p => String(p.id) === String(id));
                const details = form.productsDetails[id] || {};
                return (
                  <li key={id}>
                    <strong>{prod?.name || id}</strong> : {details.quantity || 1} × {details.price || 0} FCFA = {(details.quantity * details.price).toLocaleString()} FCFA
                  </li>
                );
              })}
            </ul>
            <p><strong>Total :</strong> {totalAmount.toLocaleString()} FCFA</p>
            <p><strong>Client :</strong> {form.client ? form.client : '-'}</p>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={submitting}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={!isValid || submitting}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
          {!isValid && (
            <div style={{color:'red',marginTop:'8px',fontSize:'0.95em'}}>
              Veuillez remplir tous les champs obligatoires correctement.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default InvoiceGenerator;