// components/SalesForm.jsx
import React, { useMemo, useState } from "react";
import { useEffect } from "react";
import { enableModalInputScroll } from '../utils/focusScroll';

const SalesForm = ({ products = [], onSave, onCancel }) => {
  useEffect(() => {
    // Active le scroll auto sur mobile quand le modal est monté
    const cleanup = enableModalInputScroll('.modal');
    return () => {
      if (cleanup) cleanup();
    };
  }, []);
  const [saleData, setSaleData] = useState({
    product_ids: [], // tableau d'IDs produits sélectionnés
    productsDetails: {}, // { id: { quantity, price } }
    client: "",
    payment_method: "cash",
    status: "unpaid", // unpaid, paid, proforma
    noTaxInfo: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedProducts = useMemo(
    () => products.filter((p) => saleData.product_ids.includes(String(p.id))),
    [products, saleData.product_ids]
  );

  const totalAmount = useMemo(() => {
    return selectedProducts.reduce((sum, prod) => {
      const details = saleData.productsDetails[prod.id] || {};
      const q = Number(details.quantity) || 0;
      const p = Number(details.price) || 0;
      return sum + q * p;
    }, 0);
  }, [selectedProducts, saleData.productsDetails]);

  const handleProductCheck = (id) => (e) => {
    const checked = e.target.checked;
    setSaleData((prev) => {
      const ids = checked
        ? [...prev.product_ids, String(id)]
        : prev.product_ids.filter(pid => pid !== String(id));
      const newDetails = { ...prev.productsDetails };
      if (checked && !newDetails[id]) {
        const prod = products.find(p => String(p.id) === String(id));
        newDetails[id] = {
          quantity: 1,
          price: prod ? Number(prod.price) || 0 : 0
        };
      }
      if (!checked) {
        delete newDetails[id];
      }
      return {
        ...prev,
        product_ids: ids,
        productsDetails: newDetails
      };
    });
  };

  const handleProductDetailChange = (id, key) => (e) => {
    const raw = e.target.value;
    setSaleData((prev) => ({
      ...prev,
      productsDetails: {
        ...prev.productsDetails,
        [id]: {
          ...prev.productsDetails[id],
          [key]: raw === "" ? "" : Number(raw)
        }
      }
    }));
  };

  const isValid = useMemo(() => {
    const hasProducts = saleData.product_ids.length > 0;
    const allValid = saleData.product_ids.every(id => {
      const details = saleData.productsDetails[id] || {};
      const qty = Number(details.quantity);
      const price = Number(details.price);
      return Number.isFinite(qty) && qty > 0 && Number.isFinite(price) && price > 0;
    });
    const clientOk = String(saleData.client).trim().length > 0;
    return hasProducts && allValid && clientOk;
  }, [saleData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation stricte côté frontend
    if (!isValid) {
      setError(
        "Veuillez sélectionner un produit, saisir une quantité et un prix valides, et renseigner le client."
      );
      return;
    }

    // Vérification supplémentaire pour chaque produit
    for (const id of saleData.product_ids) {
      const details = saleData.productsDetails[id] || {};
      if (!details.quantity || !details.price || details.quantity <= 0 || details.price <= 0) {
        setError("La quantité et le prix doivent être renseignés et supérieurs à zéro pour chaque produit.");
        return;
      }
    }

    if (typeof onSave !== "function") {
      setError(
        "La fonction onSave n'est pas fournie par le parent. Vérifiez le composant parent."
      );
      return;
    }

    try {
      setSubmitting(true);

      // Normalise les types avant envoi
      const payload = {
        ...saleData,
        products: saleData.product_ids.map(id => {
          const prod = products.find(p => String(p.id) === String(id));
          return {
            id,
            name: prod?.name || '',
            quantity: Number(saleData.productsDetails[id]?.quantity),
            price: Number(saleData.productsDetails[id]?.price)
          };
        }),
        total: totalAmount,
        notaxinfo: saleData.noTaxInfo,
      };

      // Supporte onSave sync ou async
      await Promise.resolve(onSave(payload));

      // Ferme le modal après succès (retire cette ligne si tu préfères gérer la fermeture au parent)
      if (typeof onCancel === "function") onCancel();
    } catch (err) {
      console.error(err);
      setError(
        err?.message
          ? `Erreur lors de l'enregistrement : ${err.message}`
          : "Une erreur s'est produite lors de l'enregistrement."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Nouvelle Vente</h2>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Produits (cases à cocher) */}
          <div className="form-group">
            <label style={{fontWeight:'bold',marginBottom:'6px',display:'block'}}>Produits/Services</label>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {products.map((product) => (
                <label key={product.id} style={{display:'flex',alignItems:'center',fontSize:'1em',color:'#222'}}>
                  <input
                    type="checkbox"
                    style={{width:'16px',height:'16px'}}
                    checked={saleData.product_ids.includes(String(product.id))}
                    onChange={handleProductCheck(product.id)}
                  />
                  <span style={{marginLeft:'8px'}}>{product.name} <span style={{color:'#228b22',fontWeight:'bold'}}>- {Number(product.price).toLocaleString()} FCFA</span></span>
                </label>
              ))}
            </div>
          </div>

          {/* Quantité et prix pour chaque produit sélectionné */}
          {saleData.product_ids.map(id => {
            const prod = products.find(p => String(p.id) === String(id));
            const details = saleData.productsDetails[id] || {};
            return (
              <div key={id} className="form-group" style={{border:'1px solid #eee',borderRadius:'6px',padding:'8px',marginBottom:'8px',background:'#f9f9f9'}}>
                <strong style={{color:'#222'}}>{prod?.name || id}</strong>
                <div style={{display:'flex',gap:'12px',marginTop:'6px'}}>
                  <div>
                    <label style={{fontSize:'0.95em'}}>Quantité</label>
                    <input
                      type="number"
                      min="1"
                      value={details.quantity !== undefined ? details.quantity : 1}
                      onChange={handleProductDetailChange(id, "quantity")}
                      required
                      style={{width:'70px'}}
                    />
                  </div>
                  <div>
                    <label style={{fontSize:'0.95em'}}>Prix unitaire (FCFA)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={details.price !== undefined ? details.price : prod?.price || 0}
                      onChange={handleProductDetailChange(id, "price")}
                      required
                      style={{width:'110px'}}
                    />
                  </div>
                  <div style={{marginLeft:'16px',fontWeight:'bold',color:'#228b22',alignSelf:'center'}}>
                    {(details.quantity && details.price) ? (details.quantity * details.price).toLocaleString() + ' FCFA' : ''}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div className="form-group">
            <label htmlFor="total" style={{fontWeight:'bold'}}>Total (FCFA)</label>
            <input id="total" type="text" value={totalAmount ? totalAmount.toLocaleString() : '0'} readOnly style={{fontWeight:'bold',color:'#228b22',background:'#f3fff3'}} />
          </div>

          {/* Client */}
          <div className="form-group">
            <label htmlFor="client">Client</label>
            <input
                id="client"
                type="text"
                value={saleData.client}
                onChange={(e) =>
                  setSaleData((prev) => ({ ...prev, client: e.target.value }))
                }
                required
                style={{
                  background: '#fff',
                  color: '#222',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  width: '100%',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
          </div>

          {/* Mode de paiement */}
          <div className="form-group">
            <label htmlFor="payment">Mode de paiement</label>
            <select
              id="payment"
              value={saleData.payment_method}
              onChange={(e) =>
                setSaleData((prev) => ({
                  ...prev,
                  payment_method: e.target.value,
                }))
              }
            >
              <option value="cash">Espèces</option>
              <option value="transfert">Virement</option>
              <option value="check">Chèque</option>
              <option value="mobile">Mobile Money</option>
            </select>
          </div>

          {/* Statut */}
          <div className="form-group">
            <label htmlFor="status">Statut de la facture</label>
            <select
              id="status"
              value={saleData.status}
              onChange={(e) =>
                setSaleData((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="unpaid">Non payée ❌</option>
              <option value="paid">Payée ✅</option>
              <option value="proforma">Pro forma 📝</option>
            </select>
          </div>

          {/* Résumé */}
          <div className="sale-summary">
            <h3>Résumé de la vente</h3>
            <ul>
              {saleData.product_ids.map(id => {
                const prod = products.find(p => String(p.id) === String(id));
                const details = saleData.productsDetails[id] || {};
                return (
                  <li key={id}>
                    <strong>{prod?.name || id}</strong> : {details.quantity || 1} × {details.price || 0} FCFA = {(details.quantity * details.price).toLocaleString()} FCFA
                  </li>
                );
              })}
            </ul>
            <p>
              <strong>Total :</strong> {totalAmount.toLocaleString()} FCFA
            </p>
            <p>
              <strong>Client :</strong> {saleData.client ? saleData.client : "-"}
            </p>
          </div>

          {/* Boutons */}
          <div className="form-actions">
            <button type="button" onClick={onCancel} disabled={submitting}>
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!isValid || submitting}
            >
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
          {!isValid && (
            <div style={{color:'red',marginTop:'8px',fontSize:'0.95em'}}>
              Veuillez remplir tous les champs obligatoires correctement.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SalesForm;
