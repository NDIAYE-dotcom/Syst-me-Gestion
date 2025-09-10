import React, { useState } from "react";
import Invoice from "./Invoice";
// Chaîne base64 fictive pour le logo SOGEPI (petit carré noir)
const fakeLogoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAACYIAAAkrCAYAAABaxSuNAAAACXBIWXMAAC4jAAAuIwF4pT92AAAgAElEQVR4nOzdT29Ud7rg8ecOSEYHyXaQSECaYI90Jdgk9i6pBdi7O4sO8AJAMJvZDFG4i7tKq5o+mqx6cd3qrO5mQPACgPTm7mxYnPTOTjZEmoVNRiJpJOKyRAlLoB6d4hRdcfPHf6rK59T5fCTLqOmo08+vOlKjr5/nn/==";


const SalesList = ({ sales, products = [] }) => {
	const [selectedSale, setSelectedSale] = useState(null);
	const getProduct = (id) => products.find((p) => String(p.id) === String(id));
	return (
		<div className="sales-list">
			{selectedSale && (
				<div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:2000,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}}>
					<div style={{background:'#fff',borderRadius:'12px',padding:'24px',maxWidth:'850px',width:'100%',boxShadow:'0 2px 24px rgba(0,0,0,0.18)',position:'relative'}}>
						  <button className="invoice-close-btn" onClick={()=>setSelectedSale(null)}>&times;</button>
						<Invoice sale={selectedSale} product={getProduct(selectedSale.product_id)} logo={fakeLogoBase64} />
					</div>
				</div>
			)}
			{sales && sales.length > 0 ? (
				<div className="sales-list-grid">
					{sales.map((sale) => (
						<div className="sale-card" key={sale.id}>
							<h3>{sale.client}</h3>
							<p><strong>Produit :</strong> {getProduct(sale.product_id)?.name || sale.product_id}</p>
							<p><strong>Quantité :</strong> {sale.quantity}</p>
							<p><strong>Total :</strong> {sale.total.toLocaleString()} FCFA</p>
							<p><strong>Statut :</strong> {sale.status}</p>
							<button className="btn-primary" style={{marginTop:'10px'}} onClick={()=>setSelectedSale(sale)}>Facture</button>
						</div>
					))}
				</div>
			) : (
				<p className="no-sales-message">Aucune vente à afficher.</p>
			)}
		</div>
	);
};

export default SalesList;
