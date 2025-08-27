// components/Sidebar.jsx
import React from 'react';
import '../styles/sidebar.css';

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'sales', label: 'Ventes', icon: '💰' },
    { id: 'invoices', label: 'Factures', icon: '🧾' },
    { id: 'products', label: 'Produits/Services', icon: '📦' },
  ];

  const handleLogout = async () => {
    // Logique de déconnexion avec Supabase
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '1px', margin: 0, textAlign: 'center' }}>
          SOGEPI AFRIQUE S.A.R.L
        </h2>
      </div>
      <nav className="menu">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </button>
        ))}
      </nav>
      <button className="logout-btn" onClick={handleLogout}>
        <span className="icon">🚪</span>
        <span className="label">Déconnexion</span>
      </button>
    </div>
  );
};

export default Sidebar;