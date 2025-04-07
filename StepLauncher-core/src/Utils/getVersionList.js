const https = require('https');

/**
 * Descarga y filtra las versiones de Minecraft.
 * @param {Object} options - Opciones para filtrar.
 * @param {boolean} options.Release - Si es true, muestra solo versiones release.
 * @param {boolean} options.Snapshots - Si es true, muestra solo snapshots.
 */

function versionsList({ Release = true, Snapshots = false } = {}) {
  const url = 'https://piston-meta.mojang.com/mc/game/version_manifest.json';

  https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const versions = json.versions;

        const filtered = versions.filter(v => {
          if (Release && v.type === 'release') return true;
          if (Snapshots && v.type === 'snapshot') return true;
          return false;
        });

        if (Release) {
          console.log("=== Últimas versiones Release ===");
          filtered
            .filter(v => v.type === 'release')
            .forEach(v => console.log(`${v.id} - ${v.releaseTime}`));
        }

        if (Snapshots) {
          console.log("=== Últimas versiones Snapshot ===");
          filtered
            .filter(v => v.type === 'snapshot')
            .forEach(v => console.log(`${v.id} - ${v.releaseTime}`));
        }

        if (!Release && !Snapshots) {
          console.log("No se seleccionó Release ni Snapshots. Mostrando todo:");
          versions.forEach(v => console.log(`${v.type.toUpperCase()} - ${v.id} - ${v.releaseTime}`));
        }

      } catch (err) {
        console.error("Error al parsear JSON:", err);
      }
    });

  }).on('error', (err) => {
    console.error("Error al hacer la petición:", err);
  });
}

module.exports = versionsList;
