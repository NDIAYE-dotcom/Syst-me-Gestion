// ...existing code...
// components/Header.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../styles/header.css';
import logoSogepi from '../assets/Contact SOGEPI 7-01.png';

const Header = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [salesToday, setSalesToday] = useState(0);
  const [paidToday, setPaidToday] = useState(0);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    // Récupérer l'utilisateur connecté
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Mettre à jour l'heure en temps réel
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Charger les notifications
    loadNotifications();

    // Charger les ventes du jour
    loadSalesToday();

    // Nettoyer l'intervalle
    return () => clearInterval(timer);
  }, []);

  // Fonction pour charger les ventes du jour
  const loadSalesToday = async () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const { data, error } = await supabase
      .from('sales')
      .select('id,created_at,status')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());
    if (!error && Array.isArray(data)) {
      setSalesToday(data.length);
      setPaidToday(data.filter(sale => sale.status === 'paid').length);
    } else {
      setSalesToday(0);
      setPaidToday(0);
    }
  };

  const loadNotifications = async () => {
    // Simuler des notifications (à remplacer par une vraie source de données)
    const mockNotifications = [
      {
        id: 1,
        type: 'warning',
        title: 'Stock faible',
        message: 'Les moto-pompes sont en stock faible',
        time: 'Il y a 5 min',
        read: false
      },
      {
        id: 2,
        type: 'info',
        title: 'Nouvelle vente',
        message: 'Vente de matériel agricole enregistrée',
        time: 'Il y a 15 min',
        read: false
      },
      {
        id: 3,
        type: 'success',
        title: 'Paiement reçu',
        message: 'Facture #00123 a été payée',
        time: 'Il y a 1 heure',
        read: true
      }
    ];
    setNotifications(mockNotifications);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <header className="header">
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <img src={logoSogepi} alt="Logo SOGEPI" className="header-logo" />
        <div className="greeting">
          <h1>{getGreeting()} 👋</h1>
          <p className="current-date">
            {formatDate(currentTime)} • {formatTime(currentTime)}
          </p>
        </div>
      </div>

      <div className="header-right">
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-icon" style={{cursor: 'pointer'}} onClick={() => setShowPayModal(true)}>✅</span>
            <div className="stat-info">
              <span className="stat-value">{paidToday}</span>
              <span className="stat-label">Payées</span>
            </div>
          </div>
        </div>
        <div className="notifications-container">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <span className="notification-icon">🔔</span>
            {getUnreadCount() > 0 && (
              <span className="notification-badge">{getUnreadCount()}</span>
            )}
          </button>
          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
                {getUnreadCount() > 0 && (
                  <button 
                    className="mark-all-read"
                    onClick={markAllAsRead}
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`notification-item ${notification.type} ${
                        notification.read ? 'read' : 'unread'
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="notification-icon">
                        {notification.type === 'warning' && '⚠️'}
                        {notification.type === 'info' && 'ℹ️'}
                        {notification.type === 'success' && '✅'}
                      </div>
                      <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                      {!notification.read && <div className="unread-dot"></div>}
                    </div>
                  ))
                ) : (
                  <p className="no-notifications">Aucune notification</p>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Modale de paiement fictive */}
        {showPayModal && (
          <div className="pay-modal-overlay" onClick={() => setShowPayModal(false)}>
            <div className="pay-modal" onClick={e => e.stopPropagation()}>
              <h3>Paiement</h3>
              <p>Fonctionnalité de paiement à venir !</p>
              <button className="close-pay-modal" onClick={() => setShowPayModal(false)}>Fermer</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;