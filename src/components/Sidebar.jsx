// components/Sidebar.jsx
import React, { useState } from 'react';
import '../styles/sidebar.css';

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'sales', label: 'Ventes', icon: '💰' },
    { id: 'invoices', label: 'Factures', icon: '🧾' },
    { id: 'products', label: 'Produits/Services', icon: '📦' },
    { id: 'inventory', label: 'Inventaire', icon: '📋' },
  ];

  const [showInventoryOptions, setShowInventoryOptions] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await import('../supabaseClient').then(mod => mod.supabase.auth.signOut());
      if (error) throw error;
      window.location.reload();
    } catch (err) {
      alert('Erreur déconnexion: ' + (err.message || err));
    }
  };

  // Affichage du bouton menu sur mobile
  return (
    <>
      <div className="sidebar desktop-sidebar">
        <div className="logo">
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '1px', margin: 0, textAlign: 'center' }}>
            SOGEPI AFRIQUE S.A.R.L
          </h2>
        </div>
        <nav className="menu">
          {menuItems.slice(0,4).map(item => (
            <button
              key={item.id}
              className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </button>
          ))}
          <div style={{marginTop:'10px'}}>
            <button
              className={`menu-item ${currentPage === 'inventory' ? 'active' : ''}`}
              onClick={() => setShowInventoryOptions(v => !v)}
              style={{width:'100%'}}
            >
              <span className="icon">📋</span>
              <span className="label">Inventaire</span>
            </button>
            {showInventoryOptions && (
              <div style={{marginLeft:'20px',marginTop:'4px',display:'flex',flexDirection:'column',gap:'4px'}}>
                <button className="menu-item" onClick={() => {setCurrentPage('inventory-3mois'); setShowInventoryOptions(false);}}>3 mois</button>
                <button className="menu-item" onClick={() => {setCurrentPage('inventory-6mois'); setShowInventoryOptions(false);}}>6 mois</button>
                <button className="menu-item" onClick={() => {setCurrentPage('inventory-annuel'); setShowInventoryOptions(false);}}>Annuel</button>
              </div>
            )}
          </div>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          <span className="icon">🚪</span>
          {showMobileMenu && (
            <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
              <div className="mobile-menu-panel" onClick={e => e.stopPropagation()}>
                <div className="mobile-menu-header">
                  <span style={{fontWeight:700,fontSize:'1.1rem'}}>Menu</span>
                  <button className="close-mobile-menu" onClick={() => setShowMobileMenu(false)}>✕</button>
                </div>
                <div className="mobile-menu-list">
                  {menuItems.map(item => (
                    item.id !== 'inventory' ? (
                      <button
                        key={item.id}
                        className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
                        onClick={() => {setCurrentPage(item.id); setShowMobileMenu(false);}}
                      >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                      </button>
                    ) : (
                      <React.Fragment key={item.id}>
                        <button
                          className={`menu-item ${currentPage.startsWith('inventory') ? 'active' : ''}`}
                          onClick={() => setShowInventoryOptions(v => !v)}
                          style={{width:'100%'}}
                        >
                          <span className="icon">{item.icon}</span>
                          <span className="label">Inventaire</span>
                        </button>
                        {showInventoryOptions && (
                          <div style={{marginLeft:'20px',marginTop:'4px',display:'flex',flexDirection:'column',gap:'4px'}}>
                            <button className="menu-item" onClick={() => {setCurrentPage('inventory-3mois'); setShowInventoryOptions(false); setShowMobileMenu(false);}}>3 mois</button>
                            <button className="menu-item" onClick={() => {setCurrentPage('inventory-6mois'); setShowInventoryOptions(false); setShowMobileMenu(false);}}>6 mois</button>
                            <button className="menu-item" onClick={() => {setCurrentPage('inventory-annuel'); setShowInventoryOptions(false); setShowMobileMenu(false);}}>Annuel</button>
                          </div>
                        )}
                      </React.Fragment>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}
          <span className="label">Déconnexion</span>
        </button>
      </div>
      {/* Mobile menu button */}
      <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(true)} aria-label="Ouvrir le menu">
        <span className="menu-icon">☰</span>
      </button>
      {showMobileMenu && (
        <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
          <div className="mobile-menu-panel" onClick={e => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span style={{fontWeight:700,fontSize:'1.1rem'}}>Menu</span>
              <button className="close-mobile-menu" onClick={() => setShowMobileMenu(false)}>✕</button>
            </div>
            <div className="mobile-menu-list">
              {menuItems.map(item => (
                item.id !== 'inventory' ? (
                  <button
                    key={item.id}
                    className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => {setCurrentPage(item.id); setShowMobileMenu(false);}}
                  >
                    <span className="icon">{item.icon}</span>
                    <span className="label">{item.label}</span>
                  </button>
                ) : (
                  <React.Fragment key={item.id}>
                    <button
                      className={`menu-item ${currentPage.startsWith('inventory') ? 'active' : ''}`}
                      onClick={() => setShowInventoryOptions(v => !v)}
                      style={{width:'100%'}}
                    >
                      <span className="icon">{item.icon}</span>
                      <span className="label">Inventaire</span>
                    </button>
                    {showInventoryOptions && (
                      <div style={{marginLeft:'20px',marginTop:'4px',display:'flex',flexDirection:'column',gap:'4px'}}>
                        <button className="menu-item" onClick={() => {setCurrentPage('inventory-3mois'); setShowInventoryOptions(false); setShowMobileMenu(false);}}>3 mois</button>
                        <button className="menu-item" onClick={() => {setCurrentPage('inventory-6mois'); setShowInventoryOptions(false); setShowMobileMenu(false);}}>6 mois</button>
                        <button className="menu-item" onClick={() => {setCurrentPage('inventory-annuel'); setShowInventoryOptions(false); setShowMobileMenu(false);}}>Annuel</button>
                      </div>
                    )}
                  </React.Fragment>
                )
              ))}
              <button className="logout-btn" onClick={handleLogout}>
                <span className="icon">🚪</span>
                <span className="label">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;