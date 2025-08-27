// pages/Invoices.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import InvoiceGenerator from '../components/InvoiceGenerator';

const Invoices = () => {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        product:product_id (name)
      `)
      .order('created_at', { ascending: false });
    
    if (!error) {
      // Ajouter le nom du produit à chaque vente
      const salesWithProductName = data.map(sale => ({
        ...sale,
        product_name: sale.product?.name || 'Produit inconnu'
      }));
      setSales(salesWithProductName);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid': return <span className="badge success">Payée ✅</span>;
      case 'unpaid': return <span className="badge warning">Non payée ❌</span>;
      case 'proforma': return <span className="badge info">Pro forma 📝</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const handleGenerateInvoice = (sale) => {
    setSelectedSale(sale);
    setShowInvoice(true);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Gestion des Factures</h1>
      </div>

      {showInvoice && selectedSale && (
        <InvoiceGenerator 
          sale={selectedSale} 
          onClose={() => {
            setShowInvoice(false);
            setSelectedSale(null);
          }}
        />
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Date</th>
              <th>Client</th>
              <th>Produit/Service</th>
              <th>Quantité</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale.id}>
                <td>#{sale.id.slice(0, 8)}</td>
                <td>{new Date(sale.created_at).toLocaleDateString()}</td>
                <td>{sale.client}</td>
                <td>{sale.product_name}</td>
                <td>{sale.quantity}</td>
                <td>{(sale.quantity * sale.price).toLocaleString()} FCFA</td>
                <td>{getStatusBadge(sale.status)}</td>
                <td>
                  <button 
                    className="btn-secondary"
                    onClick={() => handleGenerateInvoice(sale)}
                  >
                    Générer Facture
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;