import React, { useEffect, useState } from 'react';
import '../styles/Inventory.css';
import { supabase } from '../supabaseClient';

const getPeriodRange = (period) => {
  const now = new Date();
  let startUTC, endUTC;
  
  endUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)).toISOString();
  
  if (period === '3mois') {
    const start = new Date(now);
    start.setMonth(now.getMonth() - 2); // Inclut le mois courant
    start.setDate(1);
    startUTC = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0)).toISOString();
  }
  
  return { startUTC, endUTC };
};

const Inventory = ({ period = '3mois' }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const { startUTC, endUTC } = getPeriodRange(period);
        
        let query = supabase
          .from('sales')
          .select('*')
          .gte('created_at', startUTC)
          .lte('created_at', endUTC);

        const { data, error } = await query;
        
        if (error) throw error;
        
        setSales(data || []);
        // Calcul du total des ventes payées
        const paidSalesTotal = (data || [])
          .filter(sale => sale.status === 'paid')
          .reduce((sum, sale) => sum + (Number(sale.total) > 0 ? Number(sale.total) : Number(sale.quantity) * Number(sale.price)), 0);
        setTotal(paidSalesTotal);
      } catch (error) {
        console.error('Erreur lors du chargement des ventes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [period]);

  return (
    <div className="inventory-container">
      <div className="inventory-bg-gradient"></div>
      {/* Sélecteur de période animé en haut */}
      <div className="period-selector-row animate-fade-in">
        <span className="svg-icon animate-pop" aria-label="calendar">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="16" rx="4" fill="var(--primary)"/>
            <rect x="7" y="2" width="10" height="6" rx="2" fill="var(--accent)"/>
          </svg>
        </span>
        {period === '3mois' ? (
          <span className="period-label-modern period-label-green animate-pop">3 mois</span>
        ) : period === '6mois' ? (
          <span className="period-label-modern animate-pop">6 mois</span>
        ) : (
          <span className="period-label-modern animate-pop">Annuel</span>
        )}
      </div>
      {/* Header moderne */}
      <div className="inventory-header glass-effect animate-fade-in">
        <div className="inventory-title-row animate-pop">
          <span className="svg-icon animate-pop" aria-label="stock">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="7" width="18" height="13" rx="3" fill="var(--primary)"/>
              <rect x="7" y="3" width="10" height="6" rx="2" fill="var(--accent)"/>
            </svg>
          </span>
          <span className="inventory-title-text animate-fade-in">Inventaire</span>
        </div>
      </div>
      {/* Statistiques principales avec animation compteur */}
      <div className="inventory-stats-grid">
  <div className="stat-card stat-card-modern-glass animate-pop" style={{background: "#232936", borderRadius: "22px", boxShadow: "0 4px 32px rgba(25,118,210,0.13)", padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: "320px", maxWidth: "400px", margin: "0 auto 32px auto"}}>
          <div className="stat-main-value stat-main-modern" style={{width: "100%", textAlign: "center"}}>
            <div className="stat-label-main stat-label-modern stat-label-center" style={{color: "#29a3ff", fontWeight: "700", fontSize: "1.35rem", marginBottom: "18px"}}>
              Total ventes payées
            </div>
            <div className="stat-value-main-horizontal-only stat-value-modern" style={{background: "#e3e8ef", borderRadius: "16px", padding: "16px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"}}>
              <span className="stat-total-value stat-total-modern stat-total-center" style={{color: "#29a3ff", fontWeight: "900", fontSize: "2.1rem", letterSpacing: "2px"}}>
                {total.toLocaleString()}
              </span>
              <span className="fcfa-main stat-badge-modern" style={{color: "#29a3ff", fontWeight: "700", fontSize: "1.35rem", marginLeft: "6px"}}>FCFA</span>
            </div>
          </div>
        </div>
      </div>
      {/* Liste des ventes avec animation d'apparition */}
      <div className="inventory-list">
        {loading ? (
          <div className="loading">Chargement des ventes...</div>
        ) : sales.length === 0 ? (
          <div className="no-sales">Aucune vente sur la période sélectionnée.</div>
        ) : (
          <div className="sales-list-grid">
            {sales.map((sale, idx) => (
              <div key={sale.id || idx} className="sale-card glass-effect sale-card-anim animate-pop" style={{ animationDelay: (idx * 0.09) + 's' }}>
                <div className="sale-row">
                  <span className="sale-label">Montant :</span>
                  <span className="sale-value stat-total-value">
                    {(Number(sale.total) > 0 ? Number(sale.total) : Number(sale.quantity) * Number(sale.price)).toLocaleString()} <span className="fcfa-main">FCFA</span>
                  </span>
                </div>
                <div className="sale-row">
                  <span className="sale-label">Statut :</span>
                  <span className={sale.status === 'paid' ? 'sale-value sale-status-payee' : 'sale-value sale-status-attente'}>
                    {sale.status === 'paid' ? (<><span>Payée</span><span style={{fontSize:'1.2em'}}>✅</span></>) : (<><span>Non payée</span><span style={{fontSize:'1.2em'}}>❌</span></>)}
                  </span>
                </div>
                <div className="sale-row">
                  <span className="sale-label">Date :</span>
                  <span className="sale-value sale-date">
                    {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Inventory;