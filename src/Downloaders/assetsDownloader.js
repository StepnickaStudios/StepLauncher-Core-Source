const download = require('../Utils/download.js');
const { readFileSync, mkdirSync, existsSync } = require('node:fs');
const { join, resolve } = require('node:path');

module.exports = async function assetsDownloader({ root, version, asset, totalSize, onProgress }) {
  const dir = resolve(root, 'assets');
  const indexAssets = join(dir, 'indexes');

  if (!existsSync(indexAssets)) mkdirSync(indexAssets, { recursive: true });

  try {
    if (onProgress) onProgress({ message: 'Descargando index de assets...' });
    await download({ url: asset, dir: indexAssets, name: `${version}.json` });
    await download({
      url: asset,
      dir: resolve(root, 'cache', 'json'),
      name: `${version}.json`,
    });
  } catch (error) {
    console.error('Error al descargar index de assets\n', error);
  }

  let size = 0,
    percentage;

  try {
    let { objects } = JSON.parse(
      readFileSync(resolve(indexAssets, `${version}.json`), { encoding: 'utf-8' })
    );

    objects = Object.values(objects);

    for (const obj of objects) {
      const fileSize = obj.size;
      const fileHash = obj.hash;
      const fileSubHash = fileHash.substring(0, 2);
      const filePath = join(dir, 'objects', fileSubHash);

      if (!existsSync(filePath)) mkdirSync(filePath, { recursive: true });

      await download({
        url: `https://resources.download.minecraft.net/${fileSubHash}/${fileHash}`,
        dir: filePath,
        name: fileHash,
      });

      size += fileSize;
      percentage = Math.floor((size / totalSize) * 100);

      const progress = Math.floor((size / totalSize) * 40);
      if (process.stdout.isTTY) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(
          `Descargando: [${'='.repeat(progress)}${' '.repeat(40 - progress)}] ${percentage}%`
        );
      } else {
        console.log(`Descargando: ${percentage}%`);
      }

      if (onProgress) {
        onProgress({
          percentage,
          file: fileHash,
          message: `Asset descargado: ${fileHash.substring(0, 8)}... (${percentage}%)`,
        });
      }
    }

    if (onProgress) onProgress({ message: 'Descarga de assets finalizada' });

  } catch (error) {
    console.error('Error al descargar archivo\n', error);
  }
};
