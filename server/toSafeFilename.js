// Sanitize filename for safe storage (removes Unicode, spaces, special chars)
export function toSafeFilename(filename) {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-zA-Z0-9.\-_]/g, '_'); // Replace unsafe chars with _
}
