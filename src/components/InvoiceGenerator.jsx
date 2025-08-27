// components/InvoiceGenerator.jsx
import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const InvoiceGenerator = ({ sale, companyInfo, onClose }) => {
  const invoiceRef = useRef();
  const [invoiceType, setInvoiceType] = useState(sale?.status || 'unpaid');

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Facture_${sale?.id}_SOGEPI`,
  });

  const calculateTotal = () => {
    return sale ? sale.quantity * sale.price : 0;
  };

  const getInvoiceTitle = () => {
    switch(invoiceType) {
      case 'paid': return 'FACTURE PAYÉE';
      case 'unpaid': return 'FACTURE';
      case 'proforma': return 'FACTURE PRO FORMA';
      default: return 'FACTURE';
    }
  };

  const getStatusText = () => {
    switch(invoiceType) {
      case 'paid': return 'Payée';
      case 'unpaid': return 'Non payée';
      case 'proforma': return 'Pro forma';
      default: return '';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="invoice-actions">
          <select 
            value={invoiceType} 
            onChange={(e) => setInvoiceType(e.target.value)}
            className="invoice-type-select"
          >
            <option value="unpaid">Facture non payée</option>
            <option value="paid">Facture payée</option>
            <option value="proforma">Facture pro forma</option>
          </select>
          
          <button className="btn-primary" onClick={handlePrint}>
            Imprimer
          </button>
          
          <button onClick={onClose}>Fermer</button>
        </div>

        <div className="invoice" ref={invoiceRef}>
          <div className="invoice-header">
            <div className="company-info">
              <img src="/logo.png" alt="SOGEPI Afrique S.A.R.L." className="invoice-logo" />
              <h2>SOGEPI Afrique S.A.R.L.</h2>
              <p>Spécialiste en moto-pompes, matériels agricoles, forage et irrigation</p>
              <p>Rue du Commerce, Dakar, Sénégal</p>
              <p>Tél: +221 33 123 45 67 | Email: contact@sogepi-afrique.com</p>
            </div>
            
            <div className="invoice-title">
              <h1>{getInvoiceTitle()}</h1>
              <p>N°: {sale?.id || '0000'}</p>
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p className={`status ${invoiceType}`}>
                Statut: {getStatusText()}
              </p>
            </div>
          </div>

          <div className="invoice-client">
            <h3>Client</h3>
            <p>{sale?.client || 'Non spécifié'}</p>
          </div>

          <div className="invoice-details">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{sale?.product_name || 'Produit/Service'}</td>
                  <td>{sale?.quantity || 1}</td>
                  <td>{sale?.price ? sale.price.toLocaleString() : '0'} FCFA</td>
                  <td>{calculateTotal().toLocaleString()} FCFA</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="invoice-total">
            <div className="total-row">
              <span>Sous-total:</span>
              <span>{calculateTotal().toLocaleString()} FCFA</span>
            </div>
            <div className="total-row">
              <span>TVA (18%):</span>
              <span>{(calculateTotal() * 0.18).toLocaleString()} FCFA</span>
            </div>
            <div className="total-row grand-total">
              <span>Total TTC:</span>
              <span>{(calculateTotal() * 1.18).toLocaleString()} FCFA</span>
            </div>
          </div>

          <div className="invoice-footer">
            <div className="payment-info">
              <h4>Conditions de paiement</h4>
              <p>Mode de paiement: {sale?.payment_method || 'Non spécifié'}</p>
              {invoiceType === 'unpaid' && (
                <p>À payer avant le: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              )}
            </div>
            
            <div className="signature">
              <p>Le Responsable Commercial</p>
              <div className="signature-line"></div>
            </div>
          </div>

          <div className="invoice-notes">
            <p>Merci pour votre confiance !</p>
            <p>Les équipements vendus bénéficient d'une garantie d'un an</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;