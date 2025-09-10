
import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Invoice = ({ sale, product, logo }) => {
  const invoiceRef = useRef();

  const tvaRate = 0.18;
  const tvaAmount = Math.round(sale.total * tvaRate);
  const netToPay = sale.total + tvaAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      // Ajout du logo SOGEPI fictif en base64 (en haut à gauche)
      // Affichage du logo SOGEPI en base64 (PNG) en haut à gauche
      if (logo && typeof logo === 'string') {
        try {
          // Utilise le format "data:image/png;base64,..." pour le logo
          doc.addImage(logo, 'PNG', 15, 10, 50, 25); // Position et taille ajustées
        } catch (e) {}
      }

      // Titre "FACTURE" centré
      doc.setFontSize(22);
      doc.setTextColor(34, 139, 34);
      doc.text('FACTURE', 105, 25, { align: 'center' });

      // Informations SOGEPI et client
      doc.setFontSize(12);
      doc.setTextColor(0,0,0);
      doc.text('SOGEPI', 15, 40);
      doc.text('Adresse : RUE TOLBIAC N°12 - DAKAR SENEGAL', 15, 47);
      doc.text(`Date : ${new Date(sale.created_at).toLocaleDateString()}`, 15, 54);
      doc.text(`Numéro : ${sale.id}`, 15, 61);
      doc.text(`Client : ${sale.client}`, 15, 68);

      // Tableau principal
      autoTable(doc, {
        startY: 80,
        head: [['Référence', 'Désignation', 'Qtés', 'P. Unitaire', 'Montant TCC']],
        body: [
          [
            product?.id || '',
            product?.name || '',
            sale?.quantity || '',
            sale?.price ? sale.price.toLocaleString() + ' FCFA' : '',
            sale?.total ? sale.total.toLocaleString() + ' FCFA' : ''
          ]
        ],
        theme: 'grid',
        headStyles: { fillColor: [34,139,34], textColor: 255 },
        styles: { fontSize: 11 }
      });

      // Calcul TVA et net à payer
      const tvaRate = 0.18;
      const tvaAmount = Math.round((sale.total || 0) * tvaRate);
      const netToPay = (sale.total || 0) + tvaAmount;

      // Tableau total/tva/net
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Total TCC', 'TVA 18%', 'NET À PAYER']],
        body: [[
          sale.total ? sale.total.toLocaleString() + ' FCFA' : '',
          tvaAmount ? tvaAmount.toLocaleString() + ' FCFA' : '',
          netToPay ? netToPay.toLocaleString() + ' FCFA' : ''
        ]],
        theme: 'grid',
        headStyles: { fillColor: [34,139,34], textColor: 255 },
        styles: { fontSize: 12, halign: 'center' }
      });

      // Mode de règlement
      doc.setFontSize(12);
      doc.setTextColor(0,0,0);
      doc.text(`Mode de règlement : ${sale.payment_method || ''}`, 15, doc.lastAutoTable.finalY + 15);

      // Pied de page amélioré, aligné à gauche et bien espacé
      doc.setFontSize(10);
      doc.setTextColor(34,139,34);
      doc.text('+221 77 606 29 00 - 77 512 30 76', 15, 275);
      doc.text('RUE TOLBIAC N°12 - DAKAR SENEGAL', 15, 281);
      doc.text('RCCM: SN.DKR.2022.B.18980 / NINEA : 009454258', 15, 287);
      doc.save(`Facture_${sale.client}_${sale.id}.pdf`);
    } catch (err) {
      alert('Erreur génération PDF : ' + err.message);
    }
  };

  return (
    <div className="invoice-a4" ref={invoiceRef} style={{background:'#fff',color:'#222',padding:'32px',maxWidth:'800px',margin:'0 auto',boxShadow:'0 2px 12px rgba(0,0,0,0.12)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px'}}>
        <img src={logo} alt="Logo SOGEPI" style={{height:'60px'}} />
        <h1 style={{fontSize:'2rem',color:'#228b22',background:'#e3f2fd',padding:'8px 24px',borderRadius:'8px'}}>FACTURE</h1>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'18px'}}>
        <div>
          <strong>Date :</strong> {new Date(sale.created_at).toLocaleDateString()}<br/>
          <strong>Numéro :</strong> {sale.id}<br/>
          <strong>Client :</strong> {sale.client}<br/>
        </div>
        <div style={{textAlign:'right'}}>
          <strong>Mode de règlement :</strong> {sale.payment_method}<br/>
          <strong>Statut :</strong> {sale.status}<br/>
        </div>
      </div>
      <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'18px'}}>
        <thead>
          <tr style={{background:'#228b22',color:'#fff'}}>
            <th style={{padding:'8px',border:'1px solid #ddd'}}>Référence</th>
            <th style={{padding:'8px',border:'1px solid #ddd'}}>Désignation</th>
            <th style={{padding:'8px',border:'1px solid #ddd'}}>Qtés</th>
            <th style={{padding:'8px',border:'1px solid #ddd'}}>P. Unitaire</th>
            <th style={{padding:'8px',border:'1px solid #ddd'}}>Montant TCC</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{padding:'8px',border:'1px solid #ddd'}}>{product.id}</td>
            <td style={{padding:'8px',border:'1px solid #ddd'}}>{product.name}</td>
            <td style={{padding:'8px',border:'1px solid #ddd'}}>{sale.quantity}</td>
            <td style={{padding:'8px',border:'1px solid #ddd'}}>{sale.price.toLocaleString()} FCFA</td>
            <td style={{padding:'8px',border:'1px solid #ddd'}}>{sale.total.toLocaleString()} FCFA</td>
          </tr>
        </tbody>
      </table>
      <div style={{marginBottom:'18px'}}>
        Arrêté la présente facture à la somme de : <span style={{color:'#228b22',fontWeight:'bold'}}>{sale.total.toLocaleString()} FCFA</span>
      </div>
      <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'18px'}}>
        <thead>
          <tr style={{background:'#e3f2fd',color:'#228b22'}}>
            <th style={{padding:'8px',border:'1px solid #ddd'}}>Total TCC</th>
            <th style={{padding:'8px',border:'1px solid #ddd'}}>TVA 18%</th>
            <th style={{padding:'8px',border:'1px solid #ddd'}}>NET À PAYER</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{padding:'8px',border:'1px solid #ddd',fontWeight:'bold'}}>{sale.total.toLocaleString()} FCFA</td>
            <td style={{padding:'8px',border:'1px solid #ddd',fontWeight:'bold'}}>{tvaAmount.toLocaleString()} FCFA</td>
            <td style={{padding:'8px',border:'1px solid #ddd',fontWeight:'bold'}}>{netToPay.toLocaleString()} FCFA</td>
          </tr>
        </tbody>
      </table>
      <div style={{marginBottom:'18px'}}>
        <strong>Mode de règlement :</strong> {sale.payment_method}
      </div>
      <div style={{marginTop:'32px',fontSize:'0.95em',color:'#228b22',textAlign:'center'}}>
        +221 77 606 29 00 - 77 512 30 76<br/>
        RUE TOLBIAC N°12 - DAKAR SENEGAL<br/>
        RCCM: SN.DKR.2022.B.18980 / NINEA : 009454258
      </div>
      <div style={{marginTop:'32px',display:'flex',gap:'16px',justifyContent:'center'}}>
        <button className="btn-primary" onClick={handlePrint}>Imprimer</button>
        <button className="btn-primary" onClick={handleDownloadPDF}>Enregistrer en PDF</button>
      </div>
    </div>
  );
};

export default Invoice;
