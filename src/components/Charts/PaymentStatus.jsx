// components/Charts/PaymentStatus.jsx
import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const PaymentStatus = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    proforma: 0
  });

  const COLORS = {
    paid: '#2e7d32', // Vert
    unpaid: '#d32f2f', // Rouge
    proforma: '#1976d2' // Bleu
  };

  useEffect(() => {
    processChartData();
  }, [data]);

  const processChartData = () => {
    if (!data || data.length === 0) {
      setChartData([]);
      setSummary({ total: 0, paid: 0, unpaid: 0, proforma: 0 });
      return;
    }

    const statusCount = {
      paid: 0,
      unpaid: 0,
      proforma: 0
    };

    const statusAmount = {
      paid: 0,
      unpaid: 0,
      proforma: 0
    };

    // Compter le nombre et le montant par statut
    data.forEach(sale => {
      const amount = sale.quantity * sale.price;
      const status = sale.status || 'unpaid';
      
      if (statusCount[status] !== undefined) {
        statusCount[status] += 1;
        statusAmount[status] += amount;
      }
    });

    // Préparer les données pour le graphique
    const chartData = [
      {
        name: 'Payées',
        value: statusCount.paid,
        amount: statusAmount.paid,
        color: COLORS.paid,
        status: 'paid'
      },
      {
        name: 'Non payées',
        value: statusCount.unpaid,
        amount: statusAmount.unpaid,
        color: COLORS.unpaid,
        status: 'unpaid'
      },
      {
        name: 'Pro forma',
        value: statusCount.proforma,
        amount: statusAmount.proforma,
        color: COLORS.proforma,
        status: 'proforma'
      }
    ].filter(item => item.value > 0); // Filtrer les statuts sans données

    setChartData(chartData);
    setSummary({
      total: data.length,
      paid: statusCount.paid,
      unpaid: statusCount.unpaid,
      proforma: statusCount.proforma,
      paidAmount: statusAmount.paid,
      unpaidAmount: statusAmount.unpaid,
      proformaAmount: statusAmount.proforma
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(value);
  };

  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.name}</p>
          <p className="tooltip-value">
            Quantité: <strong>{data.value}</strong>
          </p>
          <p className="tooltip-amount">
            Montant: <strong>{formatCurrency(data.amount)}</strong>
          </p>
          <p className="tooltip-percentage">
            Pourcentage: <strong>{formatPercentage(data.value, summary.total)}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="custom-legend">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="legend-label">{entry.value}</span>
            <span className="legend-count">
              ({entry.payload.value} - {formatPercentage(entry.payload.value, summary.total)})
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>Aucune donnée de paiement disponible</p>
      </div>
    );
  }

  return (
    <div className="payment-status-chart">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => 
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="payment-summary">
        <h4>Récapitulatif des paiements</h4>
        
        <div className="summary-grid">
          <div className="summary-item paid">
            <div className="summary-header">
              <span className="status-dot" style={{ backgroundColor: COLORS.paid }}></span>
              <span className="summary-title">Payées</span>
            </div>
            <div className="summary-details">
              <span className="summary-count">{summary.paid}</span>
              <span className="summary-amount">{formatCurrency(summary.paidAmount)}</span>
            </div>
          </div>

          <div className="summary-item unpaid">
            <div className="summary-header">
              <span className="status-dot" style={{ backgroundColor: COLORS.unpaid }}></span>
              <span className="summary-title">Non payées</span>
            </div>
            <div className="summary-details">
              <span className="summary-count">{summary.unpaid}</span>
              <span className="summary-amount">{formatCurrency(summary.unpaidAmount)}</span>
            </div>
          </div>

          <div className="summary-item proforma">
            <div className="summary-header">
              <span className="status-dot" style={{ backgroundColor: COLORS.proforma }}></span>
              <span className="summary-title">Pro forma</span>
            </div>
            <div className="summary-details">
              <span className="summary-count">{summary.proforma}</span>
              <span className="summary-amount">{formatCurrency(summary.proformaAmount)}</span>
            </div>
          </div>

          <div className="summary-item total">
            <div className="summary-header">
              <span className="summary-title">Total général</span>
            </div>
            <div className="summary-details">
              <span className="summary-count">{summary.total}</span>
              <span className="summary-amount">
                {formatCurrency(summary.paidAmount + summary.unpaidAmount + summary.proformaAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="payment-stats">
          <div className="stat-item">
            <span className="stat-label">Taux de paiement:</span>
            <span className="stat-value">
              {formatPercentage(summary.paid, summary.total)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">En attente:</span>
            <span className="stat-value">
              {formatPercentage(summary.unpaid, summary.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;