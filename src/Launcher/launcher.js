const { readFileSync } = require('node:fs');
const { basename, join, resolve } = require('node:path');
const { spawn } = require('node:child_process');
const { createProfile, authUser } = require('../Utils/auth.js');
const getJarFiles = require('../Utils/getJarFiles.js');
const argsResolver = require('../Utils/argsResolver.js');
const getVersion = require('../Utils/getVersion.js');
const getExtraLibs = require('../Utils/getExtraLibs.js');
const filterVersionLib = require('../Utils/filterVersionLib.js');

/**
 * Lanzar Minecraft con la configuración proporcionada
 * 
 * @param {Object} data Datos completos para jugar
 */
module.exports = async function launchMinecraft(data) {
  let { user, gameDirectory, version, type, java, usersConfig, infoGame = true } = data;
  let customVersion = version;

  version = getVersion(version);

  // Función para comprobar la versión de Minecraft
  function checkVersion(currentVersion, versionTarget) {
    const parse = (v) => v.split('.').map(n => parseInt(n));
    const [majA, minA, patchA = 0] = parse(currentVersion);
    const [majB, minB, patchB = 0] = parse(versionTarget);

    if (majA < majB) return true;
    if (majA > majB) return false;
    if (minA < minB) return true;
    if (minA > minB) return false;
    return patchA < patchB;
  }

  // Crear el perfil del usuario
  createProfile(gameDirectory);

  const userData = JSON.stringify(user);
  usersConfig = resolve(usersConfig || join(gameDirectory, 'usercache.json'));
  user = authUser({ user: userData, config: usersConfig });

  // Leer el archivo de la versión
  let versionFile;
  try {
    versionFile = readFileSync(resolve(gameDirectory, 'versions', `${version}`, `${version}.json`), 'utf-8');
  } catch (err) {
    console.error(`Error al leer el archivo de la versión: ${err.message}`);
    return;
  }
  versionFile = JSON.parse(versionFile);

  const libRoot = resolve(gameDirectory, 'libraries');
  let libNecessary = versionFile.libraries
    .filter(lib => lib.downloads?.artifact && 
      (!lib.rules || 
        lib.rules.every(rule => rule.action === 'allow' && rule.os?.name === 'windows') ||
        lib.rules.some(rule => rule.action === 'disallow' && rule.os?.name === 'osx')))
    .map(lib => basename(lib.downloads.artifact.path));

  // Manejo de versiones personalizadas
  let customFile;
  if (type !== 'release' && type !== 'snapshot') {
    try {
      customFile = readFileSync(resolve(gameDirectory, 'versions', `${customVersion}`, `${customVersion}.json`), 'utf-8');
    } catch (err) {
      console.error(`Error al leer el archivo de la versión personalizada: ${err.message}`);
      return;
    }
    customFile = JSON.parse(customFile);

    let customLibs;
    if (['forge', 'fabric', 'optifine'].includes(type)) {
      customLibs = customFile.libraries
        .filter(dep => dep.name)
        .map(customLib => {
          const parts = customLib.name.split(':');
          const [, name, version, api] = parts;
          return api ? `${name}-${version}-${api}.jar` : `${name}-${version}.jar`;
        });
    } else if (type === 'neoforge') {
      customLibs = customFile.libraries
        .filter(dep => dep.name)
        .map(customLib => {
          const parts = customLib.name.split(':');
          const [, name, version, api] = parts;
          return api ? `${name}-${version}-${api.replace('@', '.')}` : `${name}-${version.replace('@', '.')}`;
        });
    }

    libNecessary.push(...customLibs);
  }

  // Filtrar bibliotecas según el tipo
  if (['neoforge', 'fabric'].includes(type)) {
    libNecessary = filterVersionLib(libNecessary);
  }

  // Obtener las bibliotecas necesarias
  let { libraries, missingLibs } = await getJarFiles({
    root: libRoot,
    libNecessary: libNecessary,
  });

  // Agregar bibliotecas adicionales si faltan
  if (missingLibs.length > 0) {
    const extraLibs = await getExtraLibs({ missingLibs, libRoot });
    libraries += extraLibs;
  }

  // Preparar los argumentos para ejecutar Minecraft
  let args = argsResolver({
    user: user,
    libs: libraries,
    versionFile: versionFile,
    data: JSON.stringify(data),
    customFile: customFile,
  });

  const spawnRoot = resolve(gameDirectory);

  // Usar la configuración predeterminada de Java si no se especifica
  if (!java) {
    java = 'java';
  }

  // Limpiar la consola y mostrar información
  console.clear();
  console.log('Lanzando Minecraft versión:', customVersion);
  console.log('Usando Java:', java);

  // Verificación de versiones antiguas
  if (checkVersion(version, "1.7.10")) {
    console.log(`\x1b[33m⚠️  La versión ${version} es algo antigua, puede causar problemas.\x1b[0m`);
  }

  const minecraft = spawn(java, args, { cwd: spawnRoot });

  // Mostrar información del juego si está activado
  if (infoGame) {
    console.log('Información del juego activada');
    minecraft.stdout.on('data', (data) => console.log('stdout:', data.toString().trim()));
    minecraft.stderr.on('data', (data) => console.log('stderr:', data.toString().trim()));
  } else {
    console.log('Información del juego desactivada');
    // Redirigir la salida estándar y de error a la consola sin mostrar detalles
    minecraft.stdout.on('data', (data) => {});
    minecraft.stderr.on('data', (data) => {});
  }

};
