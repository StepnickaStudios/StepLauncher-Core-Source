const versionDownloader = require('../Downloaders/versionsDownloader.js');
const clientDownloader = require('../Downloaders/clientDownloader.js');
const nativesDownloader = require('../Downloaders/nativesDownloader.js');
const librariesDownloader = require('../Downloaders/librariesDownloader.js');
const assetsDownloader = require('../Downloaders/assetsDownloader.js');

/**
 *
 * @param {string} root Directorio principal - './.StepLauncher'
 * @param {string} version Version a Descargar - '1.20.4'
 * @param {string} version Tipo de Version a Descargar - 'release' o 'snapshot'
 */
module.exports = async function downloadMinecraft({ root, version, type, onProgress }) {
  let data = { root: root, version: version, type: type };
  console.clear();

  if (onProgress) onProgress({ step: 'start', message: `Empezando la descarga de Minecraft v${version}` });

  let versionData = JSON.parse(JSON.parse(await versionDownloader(data)));
  clientDownloader({
    ...data,
    client: versionData.downloads.client.url,
    onProgress: (e) => onProgress?.({ step: 'client', ...e })
  });

  nativesDownloader({
    ...data,
    libraries: versionData.libraries,
    onProgress: (e) => onProgress?.({ step: 'natives', ...e })
  });

  librariesDownloader({
    ...data,
    libraries: versionData.libraries,
    onProgress: (e) => onProgress?.({ step: 'libraries', ...e })
  });

  assetsDownloader({
    ...data,
    asset: versionData.assetIndex.url,
    totalSize: versionData.assetIndex.totalSize,
    onProgress: (e) => onProgress?.({ step: 'assets', ...e })
  });
};
