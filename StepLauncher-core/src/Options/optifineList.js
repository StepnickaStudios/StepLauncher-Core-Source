const https = require('https');

/**
 * Scrapea la página oficial de OptiFine para obtener las versiones.
 */
function getOptiFineVersions() {
  const url = 'https://optifine.net/downloads';

  https.get(url, (res) => {
    let html = '';

    res.on('data', chunk => html += chunk);

    res.on('end', () => {
      try {
        // Extrae cada línea <tr> de descarga
        const rows = [...html.matchAll(/<tr class='downloadLine.*?<\/tr>/gs)];
        const versions = [];

        rows.forEach(row => {
          const rowHtml = row[0];

          const versionMatch = rowHtml.match(/<td class='colFile'>(.*?)<\/td>/);
          const forgeMatch = rowHtml.match(/<td class='colForge'>(.*?)<\/td>/);
          const dateMatch = rowHtml.match(/<td class='colDate'>(.*?)<\/td>/);
          const mirrorMatch = rowHtml.match(/<td class='colMirror'><a href="(.*?)"/);

          if (versionMatch && forgeMatch && dateMatch) {
            versions.push({
              version: versionMatch[1].trim(),
              forge: forgeMatch[1].trim(),
              date: dateMatch[1].trim(),
              mirror: mirrorMatch ? mirrorMatch[1] : null
            });
          }
        });

        if (versions.length > 0) {
          console.log("=== Versiones de OptiFine ===\n");
          versions.forEach(v => {
            console.log(`Versión: ${v.version}`);
            console.log(`Forge: ${v.forge}`);
            console.log(`Fecha: ${v.date}`);
            console.log(`Mirror: ${v.mirror}`);
            console.log('----------------------------');
          });
        } else {
          console.log("No se encontraron versiones de OptiFine.");
        }

      } catch (err) {
        console.error("❌ Error al procesar HTML:", err);
      }
    });

  }).on('error', (err) => {
    console.error("❌ Error en la petición HTTPS:", err);
  });
}

// Ejecutar directamente
if (require.main === module) {
  getOptiFineVersions();
}

module.exports = getOptiFineVersions;
