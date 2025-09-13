// App.js
import React, { useState, useEffect } from 'react';
import { SalesRefreshProvider } from './context/SalesRefreshContext';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Invoices from './pages/Invoices';
import Products from './pages/Products';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './styles/main.css';

function App() {
  const [session, setSession] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!session) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'sales':
        return <Sales />;
      case 'invoices':
        return <Invoices />;
      case 'products':
        return <Products />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SalesRefreshProvider>
      <div className="app">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <div className="main-content">
          <Header />
          <div className="content">
            {renderPage()}
          </div>
        </div>
      </div>
    </SalesRefreshProvider>
  );
}

export default App;