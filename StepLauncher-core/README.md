
---

# 📦 StepLauncher-Core

> Módulo oficial de [StepnickaStudios](https://github.com/StepnickaStudios) para descargar y ejecutar versiones de Minecraft con progreso en tiempo real. Diseñado específicamente para launchers modernos como **StepLauncher**, pero también puede utilizarse en cualquier proyecto Node.js o Electron.

---

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![Electron](https://img.shields.io/badge/Compatible-Electron-blue)
![License](https://img.shields.io/github/license/StepnickaStudios/step-minecraft-downloader)

---

## 🌟 ¿Qué es StepLauncher-Core?

**StepLauncher-Core** es una librería JavaScript que permite:

- Descargar versiones de Minecraft directamente desde los servidores de Mojang.
- Mostrar el **progreso de descarga en tiempo real**, ideal para interfaces gráficas.
- Ejecutar versiones vanilla y modificadas como **Forge**, **NeoForge**, y próximamente **Fabric** y **OptiFine**.
- Integrarse fácilmente con proyectos en **Electron** (ideal para launchers personalizados).
- Controlar memoria, versión de Java, ruta de instalación y más.

Este módulo busca hacerte la vida más fácil si estás desarrollando tu propio launcher de Minecraft.

---

## 📦 Instalación

Para instalar el módulo:

```bash
npm install StepLauncher-Core
```

Asegúrate de tener **Node.js 18 o superior**.

---

## 🚀 ¿Cómo descargar Minecraft?

```js
const { downloadMinecraft } = require('StepLauncher-Core');

downloadMinecraft({
  root: '.StepLauncher',
  version: '1.20.4',
  type: 'release',
  onProgress: (info) => {
    console.log(`⏳ Progreso: ${info.percentage}% - Paso: ${info.step}`);
  }
});
```

### Explicación de parámetros:

| Nombre        | Tipo     | Descripción                                                                    |
|---------------|----------|--------------------------------------------------------------------------------|
| `root`        | `string` | Ruta de instalación. Por ejemplo: `.StepLauncher` o `C:/MiLauncher/Minecraft`. |
| `version`     | `string` | Versión de Minecraft a descargar, como `1.20.4`, `1.8.9`, `1.12.2`, etc.       |
| `type`        | `string` | Tipo de versión. Puede ser `release`, `snapshot`, `forge`, `neoforge`, etc.    |
| `onProgress`  | `func`   | Función que se ejecuta en cada paso de la descarga. Retorna un objeto con información del estado actual. |

---

## 📊 ¿Qué devuelve `onProgress`?

El parámetro `onProgress` es **una función de callback** que se ejecuta en cada cambio del progreso. Esto es ideal si estás trabajando con una barra de progreso o interfaz visual en tu launcher.

El objeto que se devuelve tiene esta estructura:

```js
{
  percentage: 38,             // Porcentaje completado
  step: 'Descargando assets', // Paso actual (ej. descargando JAR, assets, librerías)
  downloaded: 2745,           // Bytes descargados
  total: 8000                 // Bytes totales por descargar
}
```

Ejemplo práctico en consola:

```js
onProgress: (info) => {
  console.log(`⏳ ${info.percentage}% - ${info.step}`);
}
```

Ejemplo para interfaz gráfica (frontend):

```js
window.ElectronAPI.onProgressUpdate((info) => {
  progressBar.style.width = `${info.percentage}%`;
  progressText.textContent = `Paso: ${info.step} (${info.percentage}%)`;
});
```

---

## 💻 ¿Cómo ejecutar Minecraft?

Una vez descargado Minecraft, podés lanzarlo así:

```js
const { launchMinecraft } = require('StepLauncher-Core');

launchMinecraft({
  user: {
    username: 'step_user',
    uuid: '1234-5678-uuid',
  },
  version: '1.20.4',
  type: 'release',
  gameDirectory: '.StepLauncher',
  memory: {
    min: '2G',
    max: '4G',
  },
  java: 'C:/Program Files/Java/jdk-17/bin/java.exe', // [OPCIONAL] ELIGIRA EL JAVA POR DEFECTO QUE TENGA INSTALADO EL USUARIO
  infoGame: true // [OPCIONAL] ESTARA ACTIVADO POR  DEFECTO
});
```

| Parámetro        | Descripción |
|------------------|-------------|
| `user`           | Objeto con el nombre de usuario y UUID. No necesita token si es sin login. |
| `version`        | La versión a ejecutar, debe estar descargada.                              |
| `type`           | `release`, `forge`, `neoforge`, etc.                                       |
| `gameDirectory`  | Carpeta donde se descargó Minecraft.                                       |
| `memory`         | Memoria mínima y máxima a asignar.                                         |
| `java`           | Ruta del ejecutable de Java. Si no se especifica, se usará el del sistema. |
| `infoGame`       | Muestra logs del juego. `true` por defecto.                                |  

---

## 🧪 Soporte para Forge, NeoForge, Fabric, Optifine, Vanilla Minecraft

Este módulo **soporta versiones modificadas**, siempre que ya hayan sido instaladas:

```js
launchMinecraft({
  user: { username: 'player' },
  version: '1.12.2-forge-14.23.5.2860',
  type: 'forge',
  gameDirectory: '.StepLauncher',
  memory: { min: '2G', max: '6G' },
});
```

**Importante**: Para que funcione correctamente, asegúrate de instalar correctamente Forge/NeoForge en el mismo directorio (`root`) que usaste para descargar la versión base.

---

## 🖥️ Integración completa con Electron

### Backend (`main.js` o `main.ts`):

```js
const { downloadMinecraft } = require('StepLauncher-Core');

ipcMain.handle('installMinecraft', async (_event, version) => {
  await downloadMinecraft({
    root: '.StepLauncher',
    version,
    type: 'release',
    onProgress: (info) => {
      mainWindow.webContents.send('progressUpdate', info);
    }
  });

  return 'ok';
});
```

### Frontend (`renderer.js`):

```js
window.ElectronAPI.onProgressUpdate((info) => {
  const { percentage, step } = info;
  progressBar.style.width = `${percentage}%`;
  progressText.textContent = `Descargando: ${step} (${percentage}%)`;
});
```

Esto crea una experiencia visual **muy parecida a los launchers oficiales**, pero personalizada a tu gusto.

---

## 🧾 Configuración de usuarios desde archivo (opcional)

Podés guardar tus usuarios en un archivo `.json` para no tener que escribirlo siempre:

```json
[
  {
    "name": "step_user",
    "uuid": "1234-5678-91011"
  }
]
```

Y luego usar:

```js
launchMinecraft({
  usersConfig: './users.json',
  version: '1.20.4',
  type: 'release'
});
```

---

## 🛠️ Requisitos

- Node.js 18 o superior
- Conexión a Internet para la descarga inicial
- Java instalado en el sistema (Java 8, 17 o 21) *TAMBIEN SELECCIONA EL JAVA INSTALADO EN EL SISTEMA*
- Espacio suficiente en disco

---

## 📌 Notas adicionales

- 🛡️ Este módulo no modifica archivos del sistema, todo va dentro de tu carpeta personalizada.
- ✅ Compatible con sistemas Windows, macOS y Linux.
- 🔒 No almacena contraseñas ni tokens.
- 💡 Ideal para launchers con diseño personalizado.
---

---

### 💿 `getDiskInfo`
> `const { getDiskInfo } = require('steplauncher-core')`

Este módulo obtiene el **espacio disponible, usado y total** del disco principal del sistema (por defecto `C:`), permitiéndote elegir entre tres unidades: `GB`, `MB` o `B`.

Ideal para mostrar en el frontend cuánto espacio tiene el usuario disponible antes de instalar Minecraft, mods u otras versiones.

---

### ✅ Sintaxis

```js
getDiskInfo(unit = 'GB');
```

#### 🔧 Parámetros

| Parámetro | Tipo   | Opcional | Descripción |
|----------|--------|----------|-------------|
| `unit`   | `string` | ✅ | Unidad de medida. Puede ser `'GB'`, `'MB'` o `'B'` (bytes). Por defecto es `'GB'`. |

---

### 📦 Resultado

```js
{
  free: '351.91',           // Espacio libre
  used: '94.47',            // Espacio usado
  total: '446.38',          // Espacio total
  usagePercent: '21.2',     // Porcentaje usado
  unit: 'GB'                // Unidad usada
}
```

---

# 📄 Documentación: `uninstallVersion.js`  

Este módulo permite **eliminar una versión específica de Minecraft** desde el directorio `.minecraft`, incluyendo todos sus archivos asociados (JSON, JAR, etc.). Está diseñado para integrarse en el **StepLauncher-core**.  

---

## 📌 **Uso básico**  
```javascript
const uninstallVersion = require('steplauncher-core');

// Ejemplo de uso
uninstallVersion(
    'C:/Users/usuario/AppData/Roaming/.minecraft', // Ruta de .minecraft
    '1.18.2'                                      // Versión a eliminar
);
```

---

## 🧠 **Explicación del código**  

### 1. **Dependencias**  
- **`fs-extra`**: Versión mejorada de `fs` con métodos como `remove` (para borrado recursivo) y `pathExists`.  
- **`path`**: Para manejar rutas de archivos multiplataforma (evita problemas con `/` o `\`).  

### 2. **Función principal: `uninstallVersion`**  
#### Parámetros:  
- **`minecraftDir`**: Ruta absoluta al directorio `.minecraft` (ej: `C:/Users/usuario/AppData/Roaming/.minecraft`).  
- **`versionId`**: Nombre de la versión (ej: `"1.12.2"` o `"fabric-1.19"`).  

#### Flujo de ejecución:  
1. **Construye rutas críticas**:  
   ```javascript
   const versionPath = path.join(minecraftDir, 'versions', versionId);
   const versionJsonPath = path.join(versionPath, `${versionId}.json`);
   ```  
   - Ejemplo: `C:/.minecraft/versions/1.18.2/1.18.2.json`.  

2. **Verifica si la versión existe**:  
   ```javascript
   if (!(await fs.pathExists(versionPath))) { ... }
   ```  
   - Si no existe, lanza un error.  

3. **Elimina la carpeta de la versión**:  
   ```javascript
   await fs.remove(versionPath);
   ```  
   - Borra recursivamente la carpeta `versions/<versión>` y todo su contenido.  

4. **Manejo de errores**:  
   - Captura y relanza errores (ej: permisos, rutas inválidas) para que el launcher los gestione.  

---

## ⚠️ **Consideraciones importantes**  
- **Validación de entradas**:  
  - Asegúrate de que `versionId` no contenga caracteres maliciosos (ej: `../../`). Usa `path.basename` si es necesario.  
- **Librerías huérfanas**:  
  - El código no limpia automáticamente librerías/assets no usados. Para esto, necesitarías un módulo adicional que analice otras versiones instaladas.  
- **Permisos**:  
  - En sistemas Linux/macOS, asegúrate de que el proceso tenga permisos de escritura.  

---

## 🛠️ **Posibles mejoras**  
1. **Limpieza de assets/librerías**:  
   ```javascript
   // Pseudocódigo para una función adicional
   async function cleanUnusedLibraries(minecraftDir) {
       // Comparar librerías en /libraries con las usadas por otras versiones
   }
   ```  
2. **Soporte para modloaders**:  
   - Eliminar archivos específicos de Forge/Fabric (ej: `version-forge.json`).  
3. **Logs detallados**:  
   - Registrar cada archivo eliminado en un archivo de log.  

---

## 📜 **Ejemplo de integración en el launcher**  
En tu módulo principal (ej: `launcher.js`):  
```javascript
const { dialog } = require('electron'); // Para diálogos en UI
const uninstallVersion = require('steplauncher-core');

async function handleUninstall() {
    try {
        await uninstallVersion(getMinecraftPath(), selectedVersion);
        dialog.showMessageBox({ message: `Versión ${selectedVersion} eliminada.` });
    } catch (error) {
        dialog.showErrorBox('Error', error.message);
    }
}
```

---

---
## 🛡️ Integridad de minecraft

## 📁 Descripción del Módulo
Este módulo proporciona funciones para gestionar mundos de Minecraft, incluyendo:
- Creación de copias de seguridad
- Verificación de integridad de archivos
- Detección de archivos corruptos

## 🔧 Funciones Principales

### 1. `backupWorld(minecraftDir, worldName, backupDir)` **FUNCIONAL**
**Propósito**: Crea una copia de seguridad completa de un mundo de Minecraft.

**Parámetros**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `minecraftDir` | string | Ruta de la carpeta `.minecraft` |
| `worldName` | string | Nombre de la carpeta del mundo a respaldar |
| `backupDir` | string | Directorio donde se guardará la copia |

**Ejemplo de uso**:
```javascript
await backupWorld(
    'C:/Users/Usuario/AppData/Roaming/.minecraft',
    'MiMundoEpico',
    'D:/backups_minecraft'
);
```

### 2. `checkWorldIntegrity(minecraftDir, worldName)` **BETA**
**Propósito**: Verifica si hay archivos corruptos en un mundo.

**Parámetros**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `minecraftDir` | string | Ruta de la carpeta `.minecraft` |
| `worldName` | string | Nombre del mundo a verificar |

**Retorna**: `boolean` - `true` si encuentra archivos corruptos

**Ejemplo de uso**:
```javascript
const tieneCorrupcion = checkWorldIntegrity(
    'C:/Users/Usuario/AppData/Roaming/.minecraft',
    'MiMundoEpico'
);
```

### 3. `checkDirectoryIntegrity(dirPath)` **BETA**
**Propósito**: Verifica archivos corruptos en cualquier directorio.

**Parámetros**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `dirPath` | string | Ruta del directorio a verificar |

**Retorna**: `boolean` - `true` si encuentra archivos corruptos

**Ejemplo de uso**:
```javascript
const tieneErrores = await checkDirectoryIntegrity(
    'C:/Users/Usuario/AppData/Roaming/.minecraft/saves'
);
```

## 🛠️ Implementación Interna

### Función auxiliar `copyDir(src, dest)`
```javascript
async function copyDir(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        entry.isDirectory() 
            ? await copyDir(srcPath, destPath)
            : await fs.copyFile(srcPath, destPath);
    }
}
```

## 💡 Mejoras Sugeridas
1. **Validación de rutas**: Asegurar que las rutas existen antes de operar
2. **Checksum de archivos**: Usar `crypto` para verificar integridad con hashes
3. **Compresión**: Implementar ZIP para ahorrar espacio en backups
4. **Logging**: Sistema de registro más detallado

## 🚨 Manejo de Errores
El módulo captura y relanza errores con mensajes descriptivos:
- Cuando un mundo no existe
- Cuando hay problemas de permisos
- Cuando hay archivos corruptos detectados

## 📝 Notas Importantes
- Requiere Node.js 18+ (por el uso de `fs.promises`)
- Las rutas deben usar el formato del sistema operativo
- La verificación de corrupción actual solo chequea tamaño cero (podría extenderse)

Este módulo es ideal para integrar en herramientas de mantenimiento de Minecraft o para automatizar backups periódicos.

---

---

### 🧪 Ejemplo de uso

```js
const { getDiskInfo } = require('steplauncher-core');

console.log("En GB:", getDiskInfo('GB'));
console.log("En MB:", getDiskInfo('MB'));
console.log("En Bytes:", getDiskInfo('B'));
```

#### 💡 Resultado esperado:

```bash
En GB: {
  free: '351.91',
  used: '94.47',
  total: '446.38',
  usagePercent: '21.2',
  unit: 'GB'
}
En MB: {
  free: '360353.68',
  used: '96735.32',
  total: '457089.00',
  usagePercent: '21.2',
  unit: 'MB'
}
En Bytes: {
  free: '377858220032.00',
  used: '101434331136.00',
  total: '479292551168.00',
  usagePercent: '21.2',
  unit: 'B'
}
```

---

### 🛠️ Modulos que se exporta StepLauncher-Core

```js
const downloadMinecraft = require('./Launcher/downloader.js');
const launchMinecraft = require('./Launcher/launcher.js');
const { versionsList,getNeoForgeVersions,getForgeVersions,getOptiFineVersions,getFabricLoaderVersions,getDiskInfo } = require('./Launcher/options.js');

module.exports = { downloadMinecraft, uninstallVersion ,launchMinecraft, versionsList, getNeoForgeVersions, getForgeVersions, getOptiFineVersions, getFabricLoaderVersions, getDiskInfo };
```

---


## 👨‍💻 Autor

Hecho con ❤️ por **Santiago Stepnicka**  
📦 [StepnickaStudios](https://github.com/StepnickaStudios)  
🚀 Proyecto oficial de [StepLauncher](https://github.com/StepnickaStudios/StepLauncher)

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.  
Puedes usarlo libremente, incluso en proyectos comerciales, siempre que respetes la licencia.

---

## ⭐ ¿Te gusta?

¡Apoyá el proyecto con una estrella en GitHub o compartilo con otros devs de launchers! 🚀  
```
