/**
 * Utilidades de Privacidad por Diseño (Privacy by Design) para la Torre de Control APS
 * Conforme a buenas prácticas de salud digital chilena e intrahospitalaria.
 */

/**
 * Enmascara un RUT chileno para evitar sobreexposición de PII en vistas generales.
 * Ejemplo: "12.458.930-K" -> "12.458.***-K"
 */
export const maskRut = (rut: string): string => {
  if (!rut) return '';
  // Si el RUT viene formateado XX.XXX.XXX-X
  const parts = rut.split('-');
  if (parts.length === 2) {
    const numPart = parts[0];
    const dv = parts[1];
    const numParts = numPart.split('.');
    if (numParts.length === 3) {
      return `${numParts[0]}.${numParts[1]}.***-${dv}`;
    }
  }
  // Fallback si no está formateado estrictamente
  return rut.replace(/^(\d{2,3})\.\d{3}/, '$1.***');
};

/**
 * Obtiene las iniciales abreviadas del nombre completo para protección de datos en tablas masivas.
 * Ejemplo: "Carmen Rosa Morales Fuentes" -> "C. R. M. F."
 */
export const getAbbreviatedName = (fullName: string): string => {
  if (!fullName) return '';
  const tokens = fullName.trim().split(/\s+/);
  return tokens.map(t => `${t[0].toUpperCase()}.`).join(' ');
};
