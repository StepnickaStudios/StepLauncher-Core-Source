const download = require('../Utils/download.js');
const { basename, resolve } = require('node:path');
const { existsSync, mkdirSync, unlinkSync } = require('node:fs');
const Zip = require('adm-zip');

module.exports = async function nativesDownloader({ root, version, libraries, onProgress }) {
  const dir = resolve(root, 'natives');
  const nativeTarget = resolve(dir, version);

  const natives = libraries
    .filter((lib) =>
      lib.downloads.classifiers &&
      (lib.downloads.classifiers['natives-windows'] || lib.downloads.classifiers['natives-windows-64'])
    )
    .map((lib) => {
      const classifier = lib.downloads.classifiers['natives-windows'] || lib.downloads.classifiers['natives-windows-64'];
      return {
        url: classifier.url,
        path: basename(classifier.path),
      };
    });

  try {
    if (onProgress) onProgress({ message: 'Preparando archivos nativos...' });

    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    if (!existsSync(nativeTarget)) mkdirSync(nativeTarget, { recursive: true });

    let completed = 0;
    const total = natives.length;

    for (const native of natives) {
      if (version === '1.8' && native.url.includes('nightly')) continue;

      try {
        await download({ url: native.url, dir: dir, name: native.path });

        await new Promise((resolveExtract) => {
          new Zip(resolve(dir, native.path)).extractAllToAsync(nativeTarget, true, resolveExtract);
        });

        unlinkSync(resolve(dir, native.path));
        completed++;

        if (onProgress) {
          const percentage = Math.floor((completed / total) * 100);
          onProgress({
            percentage,
            file: native.path,
            message: `Archivo nativo extraído: ${native.path} (${percentage}%)`,
          });
        }

      } catch (err) {
        console.error(`Error con ${native.path}:`, err);
        if (onProgress) {
          onProgress({
            message: `Error al descargar ${native.path}`,
            error: err,
          });
        }
      }
    }

    if (onProgress) onProgress({ message: 'Todos los archivos nativos están listos.' });

  } catch (error) {
    console.error('Error al preparar archivos nativos:\n', error);
    if (onProgress) onProgress({ message: 'Error general en nativosDownloader', error });
  }
};
