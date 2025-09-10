// pages/Sales.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SalesForm from '../components/SalesForm';
import SalesList from '../components/SalesList';


const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError("Erreur récupération ventes : " + error.message);
    } else {
      setSales(data);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    if (error) {
      setError("Erreur récupération produits : " + error.message);
    } else {
      setProducts(data);
    }
  };

  const handleNewSale = () => {
    setShowForm(true);
  };

  const handleSaveSale = async (saleData) => {
    const { error } = await supabase
      .from('sales')
      .insert([{ ...saleData, created_at: new Date() }]);
    if (error) {
      setError("Erreur enregistrement vente : " + error.message);
    } else {
      setShowForm(false);
      fetchSales();
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Gestion des Ventes</h1>
        <button className="btn-primary" onClick={handleNewSale}>
          Nouvelle Vente
        </button>
      </div>

      {error && (
        <div style={{color:'red',marginBottom:'12px'}}>{error}</div>
      )}

      {showForm && (
        <SalesForm 
          products={products} 
          onSave={handleSaveSale} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      <SalesList sales={sales} products={products} />
    </div>
  );
};

export default Sales;