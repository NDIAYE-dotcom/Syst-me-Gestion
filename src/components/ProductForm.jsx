// components/ProductForm.jsx
import React, { useState } from 'react';

const ProductForm = ({ product, categories, onSave, onCancel }) => {
  React.useEffect(() => {
    // Ajoute la classe 'modal-open' au body sur mobile
    if (window.innerWidth <= 600) {
      document.body.classList.add('modal-open');
    }
    return () => {
      if (window.innerWidth <= 600) {
        document.body.classList.remove('modal-open');
      }
    };
  }, []);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || categories[0] || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{product ? 'Modifier le Produit' : 'Ajouter un Produit'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom du produit/service</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Catégorie</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Prix (FCFA)</label>
            <input
              type="number"
              name="price"
              min="0"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              name="stock"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onCancel}>Annuler</button>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
