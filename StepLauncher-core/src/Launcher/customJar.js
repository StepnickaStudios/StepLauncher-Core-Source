const { spawn } = require('child_process');
const path = require('node:path')
const { resolve } = require('path');

/**
 * Ejecuta un .jar externo con Java
 * @param {string} jarPath Ruta al archivo .jar
 * @param {string[]} args Argumentos extra si hacen falta (opcional)
 * @param {string} javaPath Ruta a Java (opcional, por defecto usa 'java')
 */
function runJar(jarPath = path.join(__dirname,'./Clients/MS-Client-1.8.9.jar'), args = [], javaPath = 'java') {
  const fullPath = resolve(jarPath);
  const javaArgs = ['-jar', fullPath, ...args];

  console.log(`🧪 Ejecutando: ${javaPath} ${javaArgs.join(' ')}`);

  const jarProcess = spawn(javaPath, javaArgs, {
    cwd: process.cwd(),
    detached: false
  });

  jarProcess.stdout.on('data', (data) => {
    console.log(`[STDOUT] ${data.toString().trim()}`);
  });

  jarProcess.stderr.on('data', (data) => {
    console.error(`[STDERR] ${data.toString().trim()}`);
  });

  jarProcess.on('exit', (code) => {
    console.log(`⚙️  El proceso terminó con código ${code}`);
  });
}
runJar();