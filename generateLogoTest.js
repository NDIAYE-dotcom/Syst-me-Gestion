import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pngPath = path.join(__dirname, 'src/assets/NewLogo.png');

try {
  if (!fs.existsSync(pngPath)) {
    throw new Error(`Fichier introuvable : ${pngPath}`);
  }
  const base64 = fs.readFileSync(pngPath).toString('base64');
  const dataUrl = `data:image/png;base64,${base64}`;

  // Génère le code JS à coller dans SalesList.jsx
  const logoVarPath = path.join(__dirname, 'logoVar.js');
  fs.writeFileSync(logoVarPath, `const logoSogepiBase64 = "${dataUrl}";\n`);

  // Génère le fichier HTML de test
  const htmlPath = path.join(__dirname, 'test-logo.html');
  fs.writeFileSync(htmlPath, `
<!DOCTYPE html>
<html>
  <body>
    <img src="${dataUrl}" alt="Logo SOGEPI" />
  </body>
</html>
`);

  // Test d'écriture simple
  const testPath = path.join(__dirname, 'test.txt');
  fs.writeFileSync(testPath, 'test');

  console.log('Succès : Fichiers logoVar.js, test-logo.html et test.txt générés.');
} catch (err) {
  console.error('Erreur lors de la génération du base64 ou de la lecture/écriture de fichier :', err);
}
