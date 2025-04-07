const download = require('../Utils/download.js');
const { resolve } = require('node:path');
const { existsSync, mkdirSync } = require('node:fs');

module.exports = async function clientDownloader({ root, version, client, onProgress }) {
  const dir = resolve(root, 'versions', version);
  const clientPath = `${dir}/${version}.jar`;

  try {
    if (onProgress) onProgress({ message: 'Preparando cliente...' });

    if (!existsSync(clientPath)) {
      mkdirSync(dir, { recursive: true });

      if (onProgress) onProgress({ message: 'Descargando cliente de Minecraft...' });

      await download({
        url: client,
        dir: dir,
        name: `${version}.jar`,
      });

      if (onProgress) onProgress({ message: 'Cliente descargado correctamente.', file: `${version}.jar` });
    } else {
      const msg = 'Cliente ya descargado.';
      console.log(msg);
      if (onProgress) onProgress({ message: msg, file: `${version}.jar` });
    }
  } catch (error) {
    const msg = 'Error al descargar cliente:';
    console.error(msg, error);
    if (onProgress) onProgress({ message: msg, error });
  }
};
