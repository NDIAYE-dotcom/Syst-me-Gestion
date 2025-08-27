// pages/Sales.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SalesForm from '../components/SalesForm';
import SalesList from '../components/SalesList';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setSales(data);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (!error) setProducts(data);
  };

  const handleNewSale = () => {
    setShowForm(true);
  };

  const handleSaveSale = async (saleData) => {
    const { error } = await supabase
      .from('sales')
      .insert([{ ...saleData, created_at: new Date() }]);
    
    if (!error) {
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

      {showForm && (
        <SalesForm 
          products={products} 
          onSave={handleSaveSale} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      <SalesList sales={sales} />
    </div>
  );
};

export default Sales;