// pages/Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { SalesRefreshContext } from '../context/SalesRefreshContext';
import { supabase } from '../supabaseClient';
import DailySales from '../components/Charts/DailySales';
import PaymentStatus from '../components/Charts/PaymentStatus';
import SalesEvolution from '../components/Charts/SalesEvolution';
import '../styles/dashboard.css';

const Dashboard = () => {

  const [salesData, setSalesData] = useState([]);
  const [timeRange, setTimeRange] = useState('daily');
  const { refresh } = useContext(SalesRefreshContext);

  useEffect(() => {
    fetchSalesData();
  }, [timeRange, refresh]);

  // Ajout d'un effet pour forcer le rafraîchissement lors d'un changement de statut
  // (à utiliser dans le composant parent ou lors de la mise à jour d'une facture)

  const fetchSalesData = async () => {
    const now = new Date();
    let startUTC, endUTC;
    if (timeRange === 'daily') {
      startUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)).toISOString();
      endUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)).toISOString();
    } else if (timeRange === 'weekly') {
      // Premier jour de la semaine (dimanche)
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());
      startUTC = new Date(Date.UTC(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate(), 0, 0, 0)).toISOString();
      // Dernier jour de la semaine (samedi)
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
      endUTC = new Date(Date.UTC(lastDayOfWeek.getFullYear(), lastDayOfWeek.getMonth(), lastDayOfWeek.getDate(), 23, 59, 59)).toISOString();
    } else if (timeRange === 'monthly') {
      // Premier jour du mois
      startUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)).toISOString();
      // Dernier jour du mois
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endUTC = new Date(Date.UTC(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate(), 23, 59, 59)).toISOString();
    } else if (timeRange === 'annual') {
      // Premier jour de l'année
      startUTC = new Date(Date.UTC(now.getFullYear(), 0, 1, 0, 0, 0)).toISOString();
      // Dernier jour de l'année
      endUTC = new Date(Date.UTC(now.getFullYear(), 11, 31, 23, 59, 59)).toISOString();
    }
    // Charger uniquement les ventes de la période et les colonnes utiles
    const { data, error } = await supabase
      .from('sales')
      .select('id,created_at,quantity,price,total,status')
      .gte('created_at', startUTC)
      .lte('created_at', endUTC);
    if (!error && data) {
      setSalesData(data);
    }
  };

  const calculateTotals = () => {
    const now = new Date();
    let dailyTotal = 0, paidInvoices = 0, unpaidInvoices = 0, proformaInvoices = 0, dailyCount = 0;
  salesData.filter(sale => !sale.ischetak).forEach(sale => {
      const saleDate = new Date(sale.created_at);
      // Comptabiliser uniquement les ventes payées (statut 'paid')
      if (sale.status === 'paid') {
        if (timeRange === 'daily') {
          if (
            saleDate.getDate() === now.getDate() &&
            saleDate.getMonth() === now.getMonth() &&
            saleDate.getFullYear() === now.getFullYear()
          ) {
            if (Number(sale.quantity) > 0 && Number(sale.price) > 0) {
              dailyTotal += Number(sale.quantity) * Number(sale.price);
            } else if (Number(sale.total) > 0) {
              dailyTotal += Number(sale.total);
            }
            dailyCount++;
          }
        } else if (timeRange === 'monthly') {
          if (
            saleDate.getMonth() === now.getMonth() &&
            saleDate.getFullYear() === now.getFullYear()
          ) {
            dailyTotal += Number(sale.total);
          }
        } else if (timeRange === 'weekly') {
          const firstDayOfWeek = new Date(now);
          firstDayOfWeek.setDate(now.getDate() - now.getDay());
          const lastDayOfWeek = new Date(firstDayOfWeek);
          lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
          if (saleDate >= firstDayOfWeek && saleDate <= lastDayOfWeek) {
            dailyTotal += Number(sale.total);
          }
        } else if (timeRange === 'annual') {
          if (saleDate.getFullYear() === now.getFullYear()) {
            dailyTotal += Number(sale.total);
          }
        }
      }
      // Statut factures
      if (sale.status === 'paid') paidInvoices++;
      if (sale.status === 'unpaid') unpaidInvoices++;
      if (sale.status === 'proforma') proformaInvoices++;
    });
    return {
      dailyTotal,
      paidInvoices,
      unpaidInvoices,
      proformaInvoices,
      dailyCount
    };
  };

  const totals = calculateTotals();

  // DEBUG : Filtrer et afficher les ventes du jour
  const now = new Date();
  const ventesDuJour = salesData.filter(sale => {
  // Gestion UTC vs local
  if (sale.ischetak) return false;
  const saleDate = new Date(sale.created_at);
  // Convertir la date locale du jour en UTC min/max
  const startOfDayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));
  const endOfDayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59));
  return saleDate >= startOfDayUTC && saleDate <= endOfDayUTC;
  });

  return (
    <div className="dashboard">
      <h1>Tableau de Bord</h1>
      
      <div className="time-selector">
        <button 
          className={timeRange === 'daily' ? 'active' : ''} 
          onClick={() => setTimeRange('daily')}
        >
          Quotidien
        </button>
        <button 
          className={timeRange === 'weekly' ? 'active' : ''} 
          onClick={() => setTimeRange('weekly')}
        >
          Hebdomadaire
        </button>
        <button 
          className={timeRange === 'monthly' ? 'active' : ''} 
          onClick={() => setTimeRange('monthly')}
        >
          Mensuel
        </button>
        <button 
          className={timeRange === 'annual' ? 'active' : ''} 
          onClick={() => setTimeRange('annual')}
        >
          Annuel
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Ventes {timeRange === 'daily' ? 'du jour' : timeRange === 'weekly' ? 'de la semaine' : 'du mois'}</h3>
          <div className="stat-value">{totals.dailyTotal.toLocaleString()} FCFA</div>
          {timeRange === 'daily' && (
            <div style={{fontSize:'0.95em',color:'#228b22',marginTop:'4px'}}>
              <strong>{totals.dailyCount}</strong> vente(s) du jour
            </div>
          )}
        </div>
        
        <div className="stat-card">
         <h3><span style={{marginRight:'8px',display:'inline-flex',alignItems:'center'}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#43cea2"/><path d="M7 13.5l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>Factures Payées</h3>
         <div className="stat-value success">{totals.paidInvoices}</div>
        </div>
        
        <div className="stat-card">
         <h3><span style={{marginRight:'8px',display:'inline-flex',alignItems:'center'}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#ed6c02"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg></span>Factures Impayées</h3>
         <div className="stat-value warning">{totals.unpaidInvoices}</div>
        </div>
        
        <div className="stat-card">
         <h3><span style={{marginRight:'8px',display:'inline-flex',alignItems:'center'}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#1976d2"/><rect x="7" y="7" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="11" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="15" width="6" height="2" rx="1" fill="#fff"/></svg></span>Factures Pro Forma</h3>
         <div className="stat-value info">{totals.proformaInvoices}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Ventes par jour</h3>
          <DailySales data={salesData} />
        </div>
        
        <div className="chart-container">
          <h3>Statut des Paiements</h3>
          <PaymentStatus data={salesData} />
        </div>
        
        <div className="chart-container full-width">
          <h3>Évolution des Ventes</h3>
          <SalesEvolution data={salesData} timeRange={timeRange} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;