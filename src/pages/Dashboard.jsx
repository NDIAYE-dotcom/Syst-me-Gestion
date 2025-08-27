// pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import DailySales from '../components/Charts/DailySales';
import PaymentStatus from '../components/Charts/PaymentStatus';
import SalesEvolution from '../components/Charts/SalesEvolution';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [timeRange, setTimeRange] = useState('daily');

  useEffect(() => {
    fetchSalesData();
  }, [timeRange]);

  const fetchSalesData = async () => {
    // Récupérer les données de vente depuis Supabase
    // Filtrer par plage temporelle sélectionnée
  };

  const calculateTotals = () => {
    // Calculer les totaux des ventes, factures payées, etc.
    return {
      dailyTotal: 0,
      paidInvoices: 0,
      unpaidInvoices: 0,
      proformaInvoices: 0
    };
  };

  const totals = calculateTotals();

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
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Ventes {timeRange === 'daily' ? 'du jour' : timeRange === 'weekly' ? 'de la semaine' : 'du mois'}</h3>
          <div className="stat-value">{totals.dailyTotal.toLocaleString()} FCFA</div>
        </div>
        
        <div className="stat-card">
          <h3>Factures Payées</h3>
          <div className="stat-value success">{totals.paidInvoices}</div>
        </div>
        
        <div className="stat-card">
          <h3>Factures Impayées</h3>
          <div className="stat-value warning">{totals.unpaidInvoices}</div>
        </div>
        
        <div className="stat-card">
          <h3>Factures Pro Forma</h3>
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