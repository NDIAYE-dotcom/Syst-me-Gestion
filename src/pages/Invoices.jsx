// pages/Invoices.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesRefreshContext } from '../context/SalesRefreshContext';
import { supabase } from '../supabaseClient';


import Invoice from '../components/Invoice';

// Hook pour charger le logo en base64 depuis /public/logo-SOGEPI.png
function useLogoBase64() {
  const [logoBase64, setLogoBase64] = React.useState(null);
  React.useEffect(() => {
    fetch('/logo-SOGEPI.png')
      .then(res => res.blob())
      .then(blob => {
        const reader = new window.FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result);
        };
        reader.readAsDataURL(blob);
      });
  }, []);
  return logoBase64;
}

const Invoices = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const { triggerRefresh } = useContext(SalesRefreshContext);
  const logoSogepiBase64 = useLogoBase64();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) {
      const salesWithProductName = data.map(sale => ({
        ...sale,
        product_name: sale.product_name || sale.product_id || 'Produit inconnu'
      }));
      setSales(salesWithProductName);
      setFetchError(null);
    } else {
      setSales([]);
      setFetchError(error?.message || 'Erreur lors de la récupération des ventes.');
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

  const handleShowInvoice = (sale) => {
    setSelectedSale(sale);
  };

  const handleUpdateStatus = async (sale, newStatus) => {
    if (!sale || !sale.id) return;
    const { error } = await supabase
      .from('sales')
      .update({ status: newStatus })
      .eq('id', sale.id);
    if (!error) {
      fetchSales();
      setSelectedSale(null);
      triggerRefresh(); // Déclenche le rafraîchissement global
      navigate('/dashboard'); // Redirige vers le dashboard
    } else {
      alert('Erreur lors de la modification du statut : ' + error.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Gestion des Factures</h1>
      </div>
      {selectedSale && selectedSale.id ? (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:2000,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:'12px',padding:'24px',maxWidth:'850px',width:'100%',boxShadow:'0 2px 24px rgba(0,0,0,0.18)',position:'relative'}}>
            <button className="invoice-close-btn" onClick={()=>setSelectedSale(null)}>&times;</button>
            <Invoice sale={selectedSale} logo={logoSogepiBase64} />
            {(selectedSale.status === 'unpaid' || selectedSale.status === 'proforma') && (
              <button className="btn-primary" style={{marginTop:'18px'}} onClick={()=>handleUpdateStatus(selectedSale, 'paid')}>
                Marquer comme Payée
              </button>
            )}
          </div>
        </div>
      ) : null}

  <div className="sales-list-grid" style={{justifyContent:'center',marginTop:'24px'}}>
        {fetchError && (
          <div style={{color:'red',textAlign:'center',margin:'24px 0',fontWeight:'bold',width:'100%'}}>
            {fetchError}
          </div>
        )}
        {sales.length === 0 ? (
          <div style={{textAlign:'center',color:'#888',fontSize:'1.1em',padding:'32px 0',width:'100%'}}>Aucune facture à afficher.</div>
        ) : (
          sales.map(sale => {
            const isMulti = Array.isArray(sale.products) && sale.products.length > 0;
            const produits = isMulti
              ? sale.products.map(p => p.name || p.id).join(', ')
              : sale.product_name;
            const quantite = isMulti
              ? sale.products.reduce((sum, p) => sum + Number(p.quantity), 0)
              : sale.quantity;
            const montant = isMulti
              ? sale.products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.price)), 0)
              : (sale.quantity * sale.price);
            return (
              <div key={sale.id} className="sale-card">
                <h3 style={{marginBottom:'8px'}}>Facture #{typeof sale.id === 'string' ? sale.id.slice(0, 8) : String(sale.id || '-').slice(0, 8)}</h3>
                <p><strong>Date :</strong> {sale.created_at ? new Date(sale.created_at).toLocaleDateString() : '-'}</p>
                <p><strong>Client :</strong> {sale.client || '-'}</p>
                <p><strong>Produit(s) :</strong> {produits}</p>
                <p><strong>Quantité :</strong> {quantite || '-'}</p>
                <p><strong>Montant :</strong> <span style={{color:'#228b22',fontWeight:'bold'}}>{montant ? montant.toLocaleString() + ' FCFA' : '-'}</span></p>
                <p>{getStatusBadge(sale.status)}</p>
                <button 
                  className="btn-primary"
                  style={{marginTop:'10px'}}
                  onClick={() => handleShowInvoice(sale)}
                >
                  Voir la facture
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Invoices;