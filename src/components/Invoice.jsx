import React, { useRef } from 'react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


function formatFCFA(n) {
  if (!n && n !== 0) return '';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
}

const Invoice = ({ sale, logo }) => {
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
  // Logo Chetak si facture Chetak
  const chetakLogo = import.meta.env.BASE_URL + 'LogoChetak-01.png';
  const isChetak = sale.ischetak === true || sale.ischetak === 'true';
  // Signature SOGEPI (dans /public)
  const signatureUrl = import.meta.env.BASE_URL + 'Signature SOGEPI.png';
  // Cachet spécifique pour les factures Chetak
  const cachetChetakUrl = import.meta.env.BASE_URL + 'Cachet Chetak S.png';
  const invoiceRef = useRef();

  const tvaRate = sale.notaxinfo ? 0 : 0.18;
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
  const tvaAmountFinal = (sale.notaxinfo || isChetak) ? 0 : Math.round(total * 0.18);
  const netToPay = (sale.notaxinfo || isChetak) ? total : total + tvaAmountFinal;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      // Dimensions et marges
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 32;
      const headerY = 32;
      const headerHeight = 60;
      const logoHeight = 36;
      const logoWidth = 36;
      const logoX = marginX;
      const logoY = headerY;
      // Logo Chetak ou SOGEPI
      let logoToUse = logo;
      if (isChetak) {
        logoToUse = chetakLogo;
      }
      if (logoToUse && typeof logoToUse === 'string') {
        try {
          if (logoToUse.startsWith('data:image/png;base64,')) {
            doc.addImage(logoToUse.replace('data:image/png;base64,', ''), 'PNG', logoX, logoY, logoWidth, logoHeight, undefined, 'BASE64');
          } else {
            doc.addImage(logoToUse, 'PNG', logoX, logoY, logoWidth, logoHeight);
          }
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
      if (!(sale.notaxinfo || isChetak)) {
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 22,
          head: [['Total TCC', 'TVA 18%', 'NET À PAYER']],
          body: [[
            formatFCFA(total),
            formatFCFA(tvaAmountFinal),
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
      }
      doc.setFontSize(12);
      doc.setTextColor(0,0,0);
      doc.text(`Mode de règlement : ${sale.payment_method || ''}`, marginX, doc.lastAutoTable.finalY + 18);

  // Ajouter la signature SOGEPI juste avant le footer (si applicable)
  if (!isChetak) {
        try {
          // Charger l'image de la signature en base64
          const sigResp = await fetch(signatureUrl);
          if (sigResp && sigResp.ok) {
            const sigBlob = await sigResp.blob();
            const reader = new FileReader();
            const sigDataUrl = await new Promise((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(sigBlob);
            });
            // Créer un objet Image pour obtenir le ratio et préserver les proportions
            const imgEl = await new Promise((resolve, reject) => {
              const im = new Image();
              im.onload = () => resolve(im);
              im.onerror = reject;
              im.src = sigDataUrl;
            });
            const ratio = (imgEl.width && imgEl.height) ? (imgEl.width / imgEl.height) : 1;
            // Définir une largeur maxi en unités du document et calculer la hauteur en conservant le ratio
            const maxSigWidth = 60; // ajustable
            const sigWidth = Math.min(maxSigWidth, pageWidth / 2);
            const sigHeight = sigWidth / ratio;
            const sigX = pageWidth - marginX - sigWidth; // aligné à droite
            const sigY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 28 : pageHeight - 120;
            try {
              doc.addImage(sigDataUrl, 'PNG', sigX, sigY, sigWidth, sigHeight);
            } catch (e) {
              // ignore si l'image ne peut pas être ajoutée
            }
          }
        } catch (e) {
          // ignore erreurs signature
        }
      }
      
      // Ajouter le cachet Chetak avant le footer pour les factures Chetak
      if (isChetak) {
        try {
          const resp = await fetch(cachetChetakUrl);
          if (resp && resp.ok) {
            const blob = await resp.blob();
            const reader2 = new FileReader();
            const dataUrl = await new Promise((resolve, reject) => {
              reader2.onloadend = () => resolve(reader2.result);
              reader2.onerror = reject;
              reader2.readAsDataURL(blob);
            });
            const imgEl = await new Promise((resolve, reject) => {
              const im = new Image();
              im.onload = () => resolve(im);
              im.onerror = reject;
              im.src = dataUrl;
            });
            const ratio2 = (imgEl.width && imgEl.height) ? (imgEl.width / imgEl.height) : 1;
            const maxSigWidth2 = 50;
            const sigWidth2 = Math.min(maxSigWidth2, pageWidth / 2);
            const sigHeight2 = sigWidth2 / ratio2;
            const sigX2 = (pageWidth - sigWidth2) / 2; // centré
            const sigY2 = doc.lastAutoTable ? doc.lastAutoTable.finalY + 28 : pageHeight - 120;
            try {
              doc.addImage(dataUrl, 'PNG', sigX2, sigY2, sigWidth2, sigHeight2);
            } catch (e) {
              // ignore
            }
          }
        } catch (e) {
          // ignore
        }
      }
      // Footer moderne centré et gris
      doc.setFontSize(10);
      doc.setTextColor(120,120,120);
      if (isChetak) {
        doc.text('+221 77 606 29 00 - 77 512 30 76', pageWidth/2, 275, {align:'center'});
        doc.text('RUE TOLBIAC N°12 - DAKAR SENEGAL', pageWidth/2, 281, {align:'center'});
      } else {
        doc.text('+221 77 606 29 00 - 77 512 30 76', pageWidth/2, 275, {align:'center'});
        doc.text('RUE TOLBIAC N°12 - DAKAR SENEGAL', pageWidth/2, 281, {align:'center'});
        if (!sale.notaxinfo) {
          doc.text('RCCM: SN.DKR.2022.B.18980 / NINEA : 009454258', pageWidth/2, 287, {align:'center'});
        }
      }
      doc.save(`Facture_${sale.client}_${sale.id}.pdf`);
    } catch (err) {
      alert('Erreur génération PDF : ' + err.message);
    }
  };

  return (
    <div className="invoice-a4" ref={invoiceRef} style={{background:'#fff',color:'#222',padding:'32px',maxWidth:'800px',margin:'0 auto',boxShadow:'0 2px 12px rgba(0,0,0,0.12)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px'}}>
        <img src={isChetak ? chetakLogo : logo} alt={isChetak ? 'Logo Chetak' : 'Logo SOGEPI'} style={{height:'60px'}} />
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
      {!(sale.notaxinfo || isChetak) ? (
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
              <td style={{padding:'8px',border:'1px solid #ddd',fontWeight:'bold'}}>{formatFCFA(tvaAmountFinal)}</td>
              <td style={{padding:'8px',border:'1px solid #ddd',fontWeight:'bold'}}>{formatFCFA(netToPay)}</td>
            </tr>
          </tbody>
        </table>
      ) : null}
      <div style={{marginBottom:'18px'}}>
        <strong>Mode de règlement :</strong> {sale.payment_method}
      </div>
      <div style={{marginTop:'32px',fontSize:'0.95em',color:'#228b22',textAlign:'center'}}>
        {isChetak ? (
          <>
            {/* Cachet Chetak affiché juste avant le pied de page (visible à l'impression) */}
            <div style={{marginTop:16, marginBottom:8, textAlign:'center'}}>
              <div style={{width:80, height:80, display:'inline-block', overflow:'hidden', borderRadius:'50%'}}>
                <img src={cachetChetakUrl} alt="Cachet Chetak" style={{width:'100%', height:'100%', objectFit:'contain', display:'block'}} />
              </div>
            </div>
            Chetak Senegal<br/>www.chetak-senegal.com<br/>
          </>
        ) : (
          <>
            {/* Signature affichée juste avant le pied de page */}
            <div style={{marginTop:16, marginBottom:8, textAlign:'right'}}>
            <div style={{width:120, height:120, display:'inline-block', overflow:'hidden', borderRadius:'50%'}}>
             <img src={signatureUrl} alt="Signature SOGEPI" style={{width:'100%', height:'100%', objectFit:'contain', display:'block'}} />
            </div>
            </div>
            +221 77 606 29 00 - 77 512 30 76<br/>
            RUE TOLBIAC N°12 - DAKAR SENEGAL<br/>
            {!sale.notaxinfo && (
              <>RCCM: SN.DKR.2022.B.18980 / NINEA : 009454258<br/></>
            )}
          </>
        )}
      </div>
      <div style={{marginTop:'32px',display:'flex',gap:'16px',justifyContent:'center'}}>
        <button className="btn-primary" onClick={handlePrint}>Imprimer</button>
        <button className="btn-primary" onClick={handleDownloadPDF}>Enregistrer en PDF</button>
      </div>
    </div>
  );
};

export default Invoice;
