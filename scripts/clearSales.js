// Script Node.js pour effacer toutes les ventes/factures dans Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || '<VITE_SUPABASE_URL>'; // Remplacez par votre URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '<VITE_SUPABASE_ANON_KEY>'; // Remplacez par votre clé
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearSales() {
  const { error } = await supabase.from('sales').delete().neq('id', 0); // Supprime toutes les lignes
  if (error) {
    console.error('Erreur lors de la suppression :', error.message);
  } else {
    console.log('Toutes les ventes/factures ont été supprimées.');
  }
}

clearSales();