import React, { useState } from "react";
import Invoice from "./Invoice";
// Chaîne base64 réelle pour le logo SOGEPI
const logoSogepiBase64 = "data:image/png;base64,ATTACHEZ_ICI_LA_CHAINE_BASE64_COMPLETE_DU_LOGO";

// Hook pour charger le logo en base64 depuis /public/logo-SOGEPI.png
function useLogoBase64() {
	const [logoBase64, setLogoBase64] = React.useState(null);
	React.useEffect(() => {
		fetch(import.meta.env.BASE_URL + 'logo-SOGEPI.png')
			.then(res => res.blob())
			.then(blob => {
				const reader = new window.FileReader();
				reader.onloadend = () => {
					setLogoBase64(reader.result);
				};
				reader.readAsDataURL(blob);
			});
	}, []);
	return logoBase64;
}

const SalesList = ({ sales, products = [] }) => {
	const [selectedSale, setSelectedSale] = useState(null);
	const logoSogepiBase64 = useLogoBase64();
	const getProduct = (id) => products.find((p) => String(p.id) === String(id));
	// Fonction pour calculer le total selon le format de vente
	const getSaleTotal = (sale) => {
		if (Array.isArray(sale.products) && sale.products.length > 0) {
			return sale.products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.price)), 0);
		}
		return Number(sale.total) || (Number(sale.quantity) * Number(sale.price)) || 0;
	};
			// Affiche toutes les ventes, y compris Chetak
			return (
				<div className="sales-list">
					{selectedSale && (
						<div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:2000,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}}>
							<div style={{background:'#fff',borderRadius:'12px',padding:'24px',maxWidth:'850px',width:'100%',boxShadow:'0 2px 24px rgba(0,0,0,0.18)',position:'relative'}}>
										<button className="invoice-close-btn" onClick={()=>setSelectedSale(null)}>&times;</button>
									<Invoice sale={selectedSale} logo={logoSogepiBase64} />
							</div>
						</div>
					)}
					{sales && sales.length > 0 ? (
						<div className="sales-list-grid">
							{sales.map((sale) => (
								<div className="sale-card" key={sale.id}>
									<h3>{sale.client}</h3>
									<p><strong>Produit :</strong> {Array.isArray(sale.products) && sale.products.length > 0
										? sale.products.map(p => getProduct(p.id)?.name || p.id).join(', ')
										: getProduct(sale.product_id)?.name || sale.product_id}
									</p>
									<p><strong>Quantité :</strong> {Array.isArray(sale.products) && sale.products.length > 0
										? sale.products.reduce((sum, p) => sum + Number(p.quantity), 0)
										: sale.quantity}
									</p>
									<p><strong>Total :</strong> {getSaleTotal(sale).toLocaleString()} FCFA</p>
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
