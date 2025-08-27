// components/Charts/DailySales.jsx
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const DailySales = ({ data, timeRange }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    processChartData();
  }, [data, timeRange]);

  const processChartData = () => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }

    const salesByDate = {};
    const now = new Date();

    // Préparer les données selon la plage temporelle
    data.forEach(sale => {
      const saleDate = new Date(sale.created_at);
      let key;

      if (timeRange === 'daily') {
        // Regrouper par heure pour la vue quotidienne
        key = saleDate.toLocaleDateString() + ' ' + saleDate.getHours() + 'h';
      } else if (timeRange === 'weekly') {
        // Regrouper par jour de la semaine pour la vue hebdomadaire
        const day = saleDate.toLocaleDateString('fr-FR', { weekday: 'short' });
        key = day;
      } else {
        // Regrouper par jour pour la vue mensuelle
        key = saleDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      }

      const total = sale.quantity * sale.price;

      if (!salesByDate[key]) {
        salesByDate[key] = {
          date: key,
          total: 0,
          count: 0
        };
      }

      salesByDate[key].total += total;
      salesByDate[key].count += 1;
    });

    // Convertir en tableau et trier
    let processedData = Object.values(salesByDate);

    // Trier par date
    processedData.sort((a, b) => {
      if (timeRange === 'daily') {
        return new Date(a.date) - new Date(b.date);
      }
      return a.date.localeCompare(b.date);
    });

    // Limiter à 7 points pour une meilleure lisibilité
    if (processedData.length > 7) {
      processedData = processedData.slice(-7);
    }

    setChartData(processedData);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">
            Total: <strong>{formatCurrency(payload[0].value)}</strong>
          </p>
          <p className="tooltip-count">
            Transactions: <strong>{payload[0].payload.count}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>Aucune donnée de vente disponible</p>
      </div>
    );
  }

  return (
    <div className="daily-sales-chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
              return value;
            }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="total" 
            name="Chiffre d'affaires" 
            fill="var(--primary-blue)" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="chart-summary">
        <div className="summary-item">
          <span className="summary-label">Période:</span>
          <span className="summary-value">
            {timeRange === 'daily' ? 'Aujourd\'hui' : 
             timeRange === 'weekly' ? 'Cette semaine' : 'Ce mois'}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total:</span>
          <span className="summary-value">
            {formatCurrency(chartData.reduce((sum, item) => sum + item.total, 0))}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Moyenne:</span>
          <span className="summary-value">
            {formatCurrency(chartData.reduce((sum, item) => sum + item.total, 0) / chartData.length)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailySales;