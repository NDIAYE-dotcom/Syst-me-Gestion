// pages/Sales.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SalesForm from '../components/SalesForm';
import SalesList from '../components/SalesList';


const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showChetakForm, setShowChetakForm] = useState(false);
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

  const handleNewChetak = () => {
    setShowChetakForm(true);
  };

  const handleSaveSale = async (saleData) => {
    // Harmonisation du format d'enregistrement
    const payload = {
      client: saleData.client,
      status: saleData.status || 'unpaid',
      payment_method: saleData.payment_method || 'cash',
      products: Array.isArray(saleData.products) ? saleData.products : (saleData.products ? [saleData.products] : []),
      total: saleData.total || (
        Array.isArray(saleData.products)
          ? saleData.products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.price)), 0)
          : (Number(saleData.quantity) * Number(saleData.price))
      ),
      created_at: new Date(),
      ischetak: saleData.isChetak || false,
    };
    const { error } = await supabase
      .from('sales')
      .insert([payload]);
    if (error) {
      setError("Erreur enregistrement vente : " + error.message);
    } else {
      setShowForm(false);
      setShowChetakForm(false);
      fetchSales();
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Gestion des Ventes</h1>
        <div style={{width:'100%',display:'flex',justifyContent:'center'}}>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap',maxWidth:'600px',width:'100%'}}>
            <button className="btn-primary" style={{minWidth:'220px'}} onClick={handleNewSale}>
              Nouvelle Vente
            </button>
            <button className="btn-primary" style={{minWidth:'220px'}} onClick={handleNewChetak}>Facture Chetak</button>
          </div>
        </div>
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
      {showChetakForm && (
        <SalesForm 
          products={products} 
          onSave={data => handleSaveSale({...data, isChetak: true})} 
          onCancel={() => setShowChetakForm(false)} 
        />
      )}

      <SalesList sales={sales} products={products} />
    </div>
  );
};

export default Sales;