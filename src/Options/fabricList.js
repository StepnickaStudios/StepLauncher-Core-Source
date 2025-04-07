const https = require('https');

function getFabricLoaderVersions() {
  const url = 'https://meta.fabricmc.net/v2/versions/loader';

  https.get(url, (res) => {
    let data = '';

    res.on('data', chunk => data += chunk);

    res.on('end', () => {
      try {
        const json = JSON.parse(data);

        console.log("=== Fabric Loader Versions ===");
        json.forEach(loader => {
          const version = loader.version;
          const stable = loader.stable ? 'Stable' : 'Beta';
          console.log(`${version} - ${stable}`);
        });

      } catch (err) {
        console.error("Error al parsear JSON:", err);
      }
    });

  }).on('error', (err) => {
    console.error("Error al hacer la petición HTTPS:", err);
  });
}

if (require.main === module) {
  getFabricLoaderVersions();
}

module.exports = getFabricLoaderVersions;
