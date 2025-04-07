const fs = require('fs-extra');
const path = require('path');

/**
 * Elimina una versión de Minecraft y sus archivos asociados.
 * @param {string} minecraftDir - Ruta de la carpeta .minecraft.
 * @param {string} versionId - ID de la versión (ej: "1.12.2").
 */
async function uninstallVersion(minecraftDir, versionId) {
    try {
        const versionPath = path.join(minecraftDir, 'versions', versionId);
        const versionJsonPath = path.join(versionPath, `${versionId}.json`);

        // Verificar si la versión existe
        if (!(await fs.pathExists(versionPath))) {
            throw new Error(`La versión ${versionId} no está instalada.`);
        }

        console.log(`[StepLauncher] Desinstalando versión: ${versionId}...`);

        // Eliminar carpeta de la versión (y todo su contenido)
        await fs.remove(versionPath);
        console.log(`[StepLauncher] Versión ${versionId} eliminada.`);

        // Opcional: Limpiar librerías no utilizadas (requiere lógica adicional)
        // await cleanUnusedLibraries(minecraftDir);

    } catch (error) {
        console.error(`[Error] No se pudo desinstalar ${versionId}:`, error.message);
        throw error; // Para manejo externo
    }
}

module.exports = uninstallVersion;