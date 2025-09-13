import React, { useRef } from 'react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


function formatFCFA(n) {
  if (!n && n !== 0) return '';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
}

const Invoice = ({ sale, logo }) => {
  const invoiceRef = useRef();

  const tvaRate = 0.18;
  // Gère les deux formats de vente
  let products = [];
  let total = 0;
  if (Array.isArray(sale.products) && sale.products.length > 0) {
    products = sale.products;
    total = products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.price)), 0);
  } else {
    products = [{
      id: sale.product_id,
      name: sale.product_name || '',
      quantity: sale.quantity,
      price: sale.price
    }];
    total = Number(sale.total) || (Number(sale.quantity) * Number(sale.price)) || 0;
  }
  const tvaAmount = Math.round(total * tvaRate);
  const netToPay = total + tvaAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      // Dimensions et marges
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 32;
      const headerY = 32;
  // Nouvelle entête identique au web
  const headerHeight = 60;
  // Logo petit à gauche
  const logoHeight = 36;
  const logoWidth = 36;
  const logoX = marginX;
  const logoY = headerY;
  if (logo && typeof logo === 'string') {
    try {
      const base64Data = logo.startsWith('data:image/png;base64,')
        ? logo.replace('data:image/png;base64,', '')
        : logo;
      doc.addImage(base64Data, 'PNG', logoX, logoY, logoWidth, logoHeight, undefined, 'BASE64');
    } catch (e) {
      doc.setFontSize(10);
      doc.setTextColor(255,0,0);
      doc.text('Erreur logo: ' + (e?.message || String(e)), logoX, logoY + 20);
    }
  }
  // Blocs infos harmonisés côte à côte, fond bleu compact
  const blockY = logoY + logoHeight + 8;
  const blockFontSize = 12;
  // Bloc gauche
  const leftBlockX = logoX;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(blockFontSize);
  doc.setTextColor(0,0,0);
  doc.text(`Date : ${new Date(sale.created_at).toLocaleDateString()}`, leftBlockX, blockY);
  doc.text(`Numéro : ${sale.id}`, leftBlockX, blockY + 8);
  doc.text(`Client : ${sale.client}`, leftBlockX, blockY + 16);
  // Bloc droit sur deux lignes, harmonisé comme le bloc gauche
  const rightBlockX = pageWidth/2 + 10;
  const rightBlockY = blockY;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(blockFontSize);
  doc.setTextColor(0,0,0);
  doc.text('Mode de règlement :', rightBlockX, rightBlockY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${sale.payment_method || ''}`, rightBlockX + doc.getTextWidth('Mode de règlement :') + 4, rightBlockY);
  doc.setFont('helvetica', 'bold');
  doc.text('Statut :', rightBlockX, rightBlockY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${sale.status || ''}`, rightBlockX + doc.getTextWidth('Statut :') + 4, rightBlockY + 8);
  // Titre 'FACTURE' moderne et compact
  const titleBgWidth = 150; // largeur réduite
  const titleBgHeight = 32; // hauteur réduite
  const titleRadius = 16; // coins arrondis plus petits
  const minTitleBgX = logoX + logoWidth + 16;
  const titleBgX = Math.max(pageWidth/2 - titleBgWidth/2, minTitleBgX);
  const titleBgY = headerY;
  // Ombre subtile sous le fond bleu
  doc.setDrawColor(210, 220, 235);
  doc.setFillColor(210, 220, 235);
  doc.roundedRect(titleBgX+2, titleBgY+4, titleBgWidth, titleBgHeight, titleRadius, titleRadius, 'F');
  // Fond bleu principal plus doux
  doc.setFillColor(235, 245, 255);
  doc.roundedRect(titleBgX, titleBgY, titleBgWidth, titleBgHeight, titleRadius, titleRadius, 'F');
  // Texte parfaitement centré
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(34, 139, 34);
  // Calcul du centrage vertical précis
  const textY = titleBgY + titleBgHeight/2 + 8;
  doc.text('FACTURE', titleBgX + titleBgWidth/2, textY, { align: 'center' });
  // Ligne de séparation sous le header
  doc.setDrawColor(220,220,220);
  doc.setLineWidth(0.8);
  doc.line(marginX, blockY + 28, pageWidth - marginX, blockY + 28);
      autoTable(doc, {
        startY: blockY + 32,
        head: [['Référence', 'Désignation', 'Qtés', 'P. Unitaire', 'Montant TCC']],
        body: products.map(p => [
          p.id || '',
          p.name || '',
          p.quantity || '',
          p.price ? formatFCFA(p.price) : '',
          p.quantity && p.price ? formatFCFA(p.quantity * p.price) : ''
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [34,139,34],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 13,
          lineWidth: 0.5,
          lineColor: [180,200,220]
        },
        styles: {
          fontSize: 12,
          halign: 'center',
          textColor: [30,30,30],
          cellPadding: 3,
          lineWidth: 0.3,
          lineColor: [220,220,220]
        },
        alternateRowStyles: { fillColor: [245,250,255] }
      });
  // Ajout de la phrase après le tableau produits
  doc.setFontSize(14);
  doc.setTextColor(34,139,34);
  doc.text(`Arrêté la présente facture à la somme de : ${formatFCFA(total)}`, marginX, doc.lastAutoTable.finalY + 12);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 22,
        head: [['Total TCC', 'TVA 18%', 'NET À PAYER']],
        body: [[
          formatFCFA(total),
          formatFCFA(tvaAmount),
          formatFCFA(netToPay)
        ]],
        theme: 'grid',
        headStyles: {
          fillColor: [227,240,255],
          textColor: [34,139,34],
          fontSize: 16,
          halign: 'center',
          fontStyle: 'bold',
          lineWidth: 0.5,
          lineColor: [180,200,220]
        },
        styles: {
          fontSize: 14,
          halign: 'center',
          textColor: [30,30,30],
          cellPadding: 3,
          lineWidth: 0.3,
          lineColor: [220,220,220]
        },
        alternateRowStyles: { fillColor: [245,250,255] }
      });
  doc.setFontSize(12);
  doc.setTextColor(0,0,0);
  doc.text(`Mode de règlement : ${sale.payment_method || ''}`, marginX, doc.lastAutoTable.finalY + 18);
  // Footer moderne centré et gris
  doc.setFontSize(10);
  doc.setTextColor(120,120,120);
  doc.text('+221 77 606 29 00 - 77 512 30 76', pageWidth/2, 275, {align:'center'});
  doc.text('RUE TOLBIAC N°12 - DAKAR SENEGAL', pageWidth/2, 281, {align:'center'});
  doc.text('RCCM: SN.DKR.2022.B.18980 / NINEA : 009454258', pageWidth/2, 287, {align:'center'});
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
          {products.map((p, idx) => (
            <tr key={idx}>
              <td style={{padding:'8px',border:'1px solid #ddd'}}>{p.id}</td>
              <td style={{padding:'8px',border:'1px solid #ddd'}}>{p.name}</td>
              <td style={{padding:'8px',border:'1px solid #ddd'}}>{p.quantity}</td>
              <td style={{padding:'8px',border:'1px solid #ddd'}}>{formatFCFA(p.price)}</td>
              <td style={{padding:'8px',border:'1px solid #ddd'}}>{formatFCFA((p.quantity && p.price) ? p.quantity * p.price : 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{marginBottom:'18px'}}>
        Arrêté la présente facture à la somme de : <span style={{color:'#228b22',fontWeight:'bold'}}>{formatFCFA(total)}</span>
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
            <td style={{padding:'8px',border:'1px solid #ddd',fontWeight:'bold'}}>{formatFCFA(total)}</td>
            <td style={{padding:'8px',border:'1px solid #ddd',fontWeight:'bold'}}>{formatFCFA(tvaAmount)}</td>
            <td style={{padding:'8px',border:'1px solid #ddd',fontWeight:'bold'}}>{formatFCFA(netToPay)}</td>
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
