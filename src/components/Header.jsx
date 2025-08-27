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

    // Nettoyer l'intervalle
    return () => clearInterval(timer);
  }, []);

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
        <img src={logoSogepi} alt="Logo SOGEPI" style={{ height: '80px', width: 'auto', borderRadius: '14px', boxShadow: '0 4px 16px rgba(25,118,210,0.18)' }} />
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
        {/* Indicateurs rapides */}
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-icon">💰</span>
            <div className="stat-info">
              <span className="stat-value">0</span>
              <span className="stat-label">Ventes aujourd'hui</span>
            </div>
          </div>
          
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <span className="stat-value">0</span>
              <span className="stat-label">Payées</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
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

        {/* Menu profil */}
        <div className="profile-container">
          <button 
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="profile-name">
              {user?.email || 'Administrateur'}
            </span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <div className="profile-avatar large">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="profile-details">
                  <h4>{user?.email || 'Administrateur'}</h4>
                  <p>Administrateur SOGEPI</p>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <button className="dropdown-item">
                <span className="item-icon">👤</span>
                Mon profil
              </button>
              
              <button className="dropdown-item">
                <span className="item-icon">⚙️</span>
                Paramètres
              </button>
              
              <div className="dropdown-divider"></div>
              
              <button 
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                <span className="item-icon">🚪</span>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;