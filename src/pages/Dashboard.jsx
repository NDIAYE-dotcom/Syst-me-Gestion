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

  const fetchSalesData = async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('*');
    if (!error && data) {
      setSalesData(data);
    }
  };

  const calculateTotals = () => {
    const now = new Date();
    let dailyTotal = 0, paidInvoices = 0, unpaidInvoices = 0, proformaInvoices = 0;
    salesData.forEach(sale => {
      const saleDate = new Date(sale.created_at);
      // Ventes du jour
      if (
        timeRange === 'daily' &&
        saleDate.getDate() === now.getDate() &&
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
      ) {
        dailyTotal += Number(sale.total);
      }
      // Ventes du mois
      if (
        timeRange === 'monthly' &&
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
      ) {
        dailyTotal += Number(sale.total);
      }
      // Ventes de la semaine
      if (
        timeRange === 'weekly'
      ) {
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(now.getDate() - now.getDay());
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        if (saleDate >= firstDayOfWeek && saleDate <= lastDayOfWeek) {
          dailyTotal += Number(sale.total);
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
      proformaInvoices
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