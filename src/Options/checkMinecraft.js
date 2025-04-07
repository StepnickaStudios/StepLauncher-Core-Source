const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Realiza una copia de seguridad de un mundo de Minecraft.
 * @param {string} minecraftDir - Ruta de la carpeta .minecraft.
 * @param {string} worldName - Nombre del mundo a respaldar.
 * @param {string} backupDir - Ruta donde guardar la copia de seguridad.
 */
async function backupWorld(minecraftDir, worldName, backupDir) {
    try {
        const worldPath = path.join(minecraftDir, 'saves', worldName);

        // Verificar si el mundo existe
        try {
            await fs.access(worldPath);
        } catch {
            throw new Error(`El mundo ${worldName} no existe.`);
        }

        console.log(`[StepLauncher-Core] Realizando copia de seguridad del mundo: ${worldName}...`);

        // Crear la ruta de la copia de seguridad
        const backupWorldPath = path.join(backupDir, `${worldName}_backup`);
        
        // Copiar el mundo a la carpeta de respaldo (usando recursión para directorios)
        await copyDir(worldPath, backupWorldPath);
        console.log(`[StepLauncher-Core] Mundo ${worldName} respaldado en ${backupWorldPath}.`);
        
    } catch (error) {
        console.error(`[Error] No se pudo realizar la copia de seguridad de ${worldName}:`, error.message);
        throw error;
    }
}

/**
 * Función auxiliar para copiar directorios recursivamente
 */
async function copyDir(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

/**
 * Verifica si hay archivos corruptos en un mundo de Minecraft.
 * @param {string} minecraftDir - Ruta de la carpeta .minecraft.
 * @param {string} worldName - Nombre del mundo a verificar.
 * @returns {boolean} - Retorna true si hay archivos corruptos, false en caso contrario.
 */
async function checkWorldIntegrity(minecraftDir, worldName) {
    try {
        const worldPath = path.join(minecraftDir, 'saves', worldName);

        // Verificar si el mundo existe
        try {
            await fs.access(worldPath);
        } catch {
            throw new Error(`El mundo ${worldName} no existe.`);
        }

        console.log(`[StepLauncher-Core] Verificando integridad del mundo: ${worldName}...`);

        // Buscar archivos .dat y .mca dentro del mundo
        const files = await fs.readdir(worldPath);
        const corruptFiles = [];

        for (let file of files) {
            const filePath = path.join(worldPath, file);
            const stats = await fs.stat(filePath);

            // Verificar si los archivos están vacíos o parecen corruptos
            if (stats.size === 0) {
                corruptFiles.push(file);
            }
        }

        if (corruptFiles.length > 0) {
            console.log(`[StepLauncher-Core] Archivos corruptos encontrados: ${corruptFiles.join(', ')}`);
            return true;
        } else {
            console.log(`[StepLauncher-Core] El mundo ${worldName} está intacto.`);
            return false;
        }
        
    } catch (error) {
        console.error(`[Error] No se pudo verificar la integridad del mundo ${worldName}:`, error.message);
        throw error;
    }
}

/**
 * Realiza un chequeo completo de archivos dentro de la carpeta .minecraft o cualquier otra ruta indicada.
 * @param {string} dirPath - Ruta de la carpeta a verificar.
 * @returns {boolean} - Retorna true si hay archivos corruptos, false si todo está bien.
 */
async function checkDirectoryIntegrity(dirPath) {
    try {
        console.log(`[StepLauncher-Core] Verificando integridad de la carpeta: ${dirPath}...`);

        // Leer todos los archivos en el directorio
        const files = await fs.readdir(dirPath);
        const corruptFiles = [];

        for (let file of files) {
            const filePath = path.join(dirPath, file);
            const stats = await fs.stat(filePath);

            // Verificar si los archivos están vacíos o parecen corruptos
            if (stats.size === 0) {
                corruptFiles.push(file);
            }
        }

        if (corruptFiles.length > 0) {
            console.log(`[StepLauncher-Core] Archivos corruptos encontrados: ${corruptFiles.join(', ')}`);
            return true;
        } else {
            console.log(`[StepLauncher-Core] Todos los archivos están en buen estado.`);
            return false;
        }
        
    } catch (error) {
        console.error(`[Error] No se pudo verificar la integridad del directorio ${dirPath}:`, error.message);
        throw error;
    }
}

module.exports = {
    backupWorld,
    checkWorldIntegrity,
    checkDirectoryIntegrity
};