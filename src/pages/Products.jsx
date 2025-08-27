// pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ProductForm from '../components/ProductForm';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState(['Moto-pompe', 'Matériel Agricole', 'Service de Forage', 'Service d\'Irrigation']);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (!error) setProducts(data);
  };

  const handleSaveProduct = async (productData) => {
    if (editingProduct) {
      // Mise à jour du produit
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      if (error) {
        alert('Erreur lors de la modification du produit : ' + error.message);
        return;
      }
      setEditingProduct(null);
      setShowForm(false);
      fetchProducts();
    } else {
      // Création d'un nouveau produit
      const { error } = await supabase
        .from('products')
        .insert([productData]);
      if (error) {
        alert('Erreur lors de l\'ajout du produit : ' + error.message);
        return;
      }
      setShowForm(false);
      fetchProducts();
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (!error) {
        fetchProducts();
      }
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Gestion des Produits/Services</h1>
        <button 
          className="btn-primary" 
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
        >
          Ajouter un Produit
        </button>
      </div>

      {showForm && (
        <ProductForm 
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-category">{product.category}</p>
              <p className="product-price">{product.price.toLocaleString()} FCFA</p>
              <p className="product-stock">Stock: {product.stock}</p>
            </div>
            <div className="product-actions">
              <button 
                className="btn-secondary"
                onClick={() => handleEditProduct(product)}
              >
                Modifier
              </button>
              <button 
                className="btn-danger"
                onClick={() => handleDeleteProduct(product.id)}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;