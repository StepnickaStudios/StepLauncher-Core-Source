const download = require('../Utils/download.js');
const { basename, dirname, resolve } = require('node:path');
const { existsSync, mkdirSync } = require('node:fs');

module.exports = async function librariesDownloader({ root, libraries, onProgress }) {
  libraries = libraries
    .filter((lib) => lib.downloads.artifact)
    .map((lib) => {
      const { url, path } = lib.downloads.artifact;
      return {
        url: url,
        path: dirname(path),
        name: basename(path),
      };
    });

  if (onProgress) onProgress({ message: 'Instalando librerías...' });
  else console.log('Instalando librerías...');

  for (const lib of libraries) {
    const libPath = resolve(root, 'libraries', lib.path);

    if (!existsSync(libPath)) mkdirSync(libPath, { recursive: true });

    try {
      if (onProgress) onProgress({ message: `Descargando librería: ${lib.name}` });

      await download({ url: lib.url, dir: libPath, name: lib.name });

    } catch (err) {
      const msg = `Error al descargar ${lib.name}:`;
      console.error(msg, err);
      if (onProgress) onProgress({ message: msg, error: err });
    }
  }

  const finishedMsg = 'Librerías instaladas correctamente.';
  if (onProgress) onProgress({ message: finishedMsg });
  else console.log(finishedMsg);
};
