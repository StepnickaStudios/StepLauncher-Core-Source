const https = require('https');

function getNeoForgeVersions() {
  const url = 'https://maven.neoforged.net/api/maven/versions/releases/net/neoforged/neoforge';

  https.get(url, (res) => {
    let data = '';

    res.on('data', chunk => data += chunk);

    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const versions = json.versions;

        if (versions && versions.length > 0) {
          console.log("=== NeoForge Versions ===");
          versions.forEach(v => console.log(v));
        } else {
          console.log("No se encontraron versiones de NeoForge.");
        }

      } catch (err) {
        console.error("❌ Error al parsear JSON de NeoForge:", err);
      }
    });

  }).on('error', (err) => {
    console.error("❌ Error en la petición HTTPS:", err);
  });
}

// Si se ejecuta directamente:
if (require.main === module) {
  getNeoForgeVersions();
}

module.exports = getNeoForgeVersions;
