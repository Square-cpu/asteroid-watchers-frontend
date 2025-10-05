// src/composables/formatDates.ts
import { DateTime } from 'luxon';

/**
 * Converts an ISO date in UTC to DD/MM/YYYY format in Brazilian time
 * @param {string} isoDate - The ISO date string in UTC
 * @returns {string} - The formatted date string in DD/MM/YYYY format
 */
export function useFormatDates() {
  const toBrazilianDate = (isoDate: string): string => {
    return DateTime.fromISO(isoDate, { zone: 'utc' })
      .setZone('America/Sao_Paulo')
      .toFormat('dd/MM/yyyy');
  };

  const toBrazilianDateTime = (isoDate: string): string => {
    return DateTime.fromISO(isoDate, { zone: 'utc' })
      .setZone('America/Sao_Paulo')
      .toFormat('dd/MM/yyyy HH:mm');
  };

  return {
    toBrazilianDate,
    toBrazilianDateTime
  };
}
