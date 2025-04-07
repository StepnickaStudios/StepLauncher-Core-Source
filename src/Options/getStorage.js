const { execSync } = require('child_process');

/**
 * Convierte bytes a la unidad deseada.
 * @param {number} bytes - El valor en bytes.
 * @param {'B'|'MB'|'GB'} unit - Unidad a convertir.
 * @returns {string} - El valor convertido con dos decimales.
 */
function convertBytes(bytes, unit = 'GB') {
  const units = {
    B: 1,
    MB: 1024 ** 2,
    GB: 1024 ** 3
  };

  if (!units[unit]) throw new Error(`Unidad inválida: ${unit}. Usa 'B', 'MB' o 'GB'`);

  return (bytes / units[unit]).toFixed(2);
}

/**
 * 
 * @param {'B'|'MB'|'GB'} unit - Unidad de retorno (por defecto GB).
 * @returns {object} Información del disco.
 */
function getDiskInfo(unit = 'GB') {
  try {
    const stdout = execSync(
      `powershell -Command "Get-PSDrive -Name C | Select-Object Used,Free, @{Name='Total';Expression={$_.Used + $_.Free}} | ConvertTo-Json"`,
      { encoding: 'utf8' }
    );

    const parsed = JSON.parse(stdout);

    return {
      free: convertBytes(parsed.Free, unit),
      used: convertBytes(parsed.Used, unit),
      total: convertBytes(parsed.Total, unit),
      usagePercent: ((parsed.Used / parsed.Total) * 100).toFixed(1),
      unit
    };
  } catch (err) {
    throw new Error('Error al obtener el espacio del disco: ' + err.message);
  }
}

if (require.main === module) {
  console.log('En GB:', getDiskInfo('GB'));
  console.log('En MB:', getDiskInfo('MB'));
  console.log('En Bytes:', getDiskInfo('B'));
}

module.exports = getDiskInfo;
