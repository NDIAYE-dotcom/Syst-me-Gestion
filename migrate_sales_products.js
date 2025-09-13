// Script de migration pour ajouter la désignation (name) dans chaque produit des anciennes factures
// À exécuter une seule fois avec Node.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase.com/dashboard/project/yhsrrbzwlbprmtaevrvx/api'; // Remplace par ton URL
const supabaseAnonKey = 'https://yhsrrbzwlbprmtaevrvx.supabase.co'; // Remplace par ta clé
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrateSalesProducts() {
  // Récupère tous les produits pour faire le mapping id -> name
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name');
  if (prodError) throw prodError;
  const productMap = {};
  products.forEach(p => { productMap[String(p.id)] = p.name; });

  // Récupère toutes les ventes/factures
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('*');
  if (salesError) throw salesError;

  for (const sale of sales) {
    if (Array.isArray(sale.products)) {
      let updated = false;
      const newProducts = sale.products.map(p => {
        if (!p.name && productMap[String(p.id)]) {
          updated = true;
          return { ...p, name: productMap[String(p.id)] };
        }
        return p;
      });
      if (updated) {
        // Met à jour la facture avec les nouveaux produits
        await supabase
          .from('sales')
          .update({ products: newProducts })
          .eq('id', sale.id);
        console.log(`Facture ${sale.id} mise à jour.`);
      }
    }
  }
  console.log('Migration terminée !');
}

// Pour exécuter la fonction principale dans un module ES
migrateSalesProducts().catch(console.error);
