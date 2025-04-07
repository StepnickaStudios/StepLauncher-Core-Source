const https = require('https');

function getForgeVersions() {
  const forgeURL = 'https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json';

  https.get(forgeURL, (res) => {
    let data = '';

    res.on('data', chunk => data += chunk);

    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const promos = json.promos;

        console.log("=== Versiones Forge ===");
        for (const key in promos) {
          const [mcVersion, tag] = key.split('-');
          const forgeVersion = promos[key];
          console.log(`Minecraft ${mcVersion} (${tag}): Forge ${forgeVersion}`);
        }
      } catch (err) {
        console.error("Error al parsear JSON de Forge:", err);
      }
    });

  }).on('error', (err) => {
    console.error("Error al hacer la petición HTTPS:", err);
  });
}

if (require.main === module) {
  getForgeVersions();
}

module.exports = getForgeVersions;
