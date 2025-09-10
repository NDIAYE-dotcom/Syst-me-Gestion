// components/SalesForm.jsx
import React, { useMemo, useState } from "react";

const SalesForm = ({ products = [], onSave, onCancel }) => {
  const [saleData, setSaleData] = useState({
    product_id: "",
    quantity: 1,
    price: 0,
    client: "",
    payment_method: "cash",
    status: "unpaid", // unpaid, paid, proforma
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedProduct = useMemo(
    () => products.find((p) => String(p.id) === String(saleData.product_id)),
    [products, saleData.product_id]
  );

  const totalAmount = useMemo(() => {
    const q = Number(saleData.quantity);
    const p = Number(saleData.price);
    if (!Number.isFinite(q) || !Number.isFinite(p)) return 0;
    return q * p;
  }, [saleData.quantity, saleData.price]);

  const handleProductChange = (e) => {
    const productId = e.target.value; // garder en string pour le <select>
    const product = products.find((p) => String(p.id) === String(productId));

    setSaleData((prev) => ({
      ...prev,
      product_id: productId,
      // on insère automatiquement le prix du produit sélectionné
      price: product ? Number(product.price) || 0 : 0,
    }));
  };

  const handleNumberChange = (key) => (e) => {
    // Autorise champ vide le temps de la saisie, convertit proprement ensuite
    const raw = e.target.value;
    setSaleData((prev) => ({
      ...prev,
      [key]: raw === "" ? "" : Number(raw),
    }));
  };

  const isValid = useMemo(() => {
    const hasProduct = saleData.product_id !== "";
    const qty = Number(saleData.quantity);
    const price = Number(saleData.price);
    const clientOk = String(saleData.client).trim().length > 0;

    return (
      hasProduct &&
      Number.isFinite(qty) &&
      qty > 0 &&
      Number.isFinite(price) &&
      price > 0 &&
      clientOk
    );
  }, [saleData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValid) {
      setError(
        "Veuillez sélectionner un produit, saisir une quantité et un prix valides, et renseigner le client."
      );
      return;
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
        product_id: selectedProduct ? selectedProduct.id : saleData.product_id,
        quantity: Number(saleData.quantity),
        price: Number(saleData.price),
        total: totalAmount,
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
          {/* Produit */}
          <div className="form-group">
            <label htmlFor="product">Produit/Service</label>
            <select
              id="product"
              value={saleData.product_id || ""}
              onChange={handleProductChange}
              required
            >
              <option value="">Sélectionner un produit/service</option>
              {products.map((product) => (
                <option key={product.id} value={String(product.id)}>
                  {product.name} - {Number(product.price).toLocaleString()} FCFA
                </option>
              ))}
            </select>
          </div>

          {/* Quantité */}
          <div className="form-group">
            <label htmlFor="quantity">Quantité</label>
            <input
              id="quantity"
              type="number"
              inputMode="numeric"
              min="1"
              value={saleData.quantity}
              onChange={handleNumberChange("quantity")}
              required
            />
          </div>

          {/* Prix unitaire */}
          <div className="form-group">
            <label htmlFor="price">Prix unitaire (FCFA)</label>
            <input
              id="price"
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              value={saleData.price}
              onChange={handleNumberChange("price")}
              required
            />
          </div>

          {/* Total */}
          <div className="form-group">
            <label htmlFor="total">Total (FCFA)</label>
            <input id="total" type="text" value={totalAmount.toLocaleString()} readOnly />
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
            <p>
              <strong>Produit :</strong>{" "}
              {selectedProduct ? selectedProduct.name : "-"}
            </p>
            <p>
              <strong>Quantité :</strong> {saleData.quantity || "-"}
            </p>
            <p>
              <strong>Total :</strong> {totalAmount.toLocaleString()} FCFA
            </p>
            <p>
              <strong>Client :</strong>{" "}
              {saleData.client ? saleData.client : "-"}
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
