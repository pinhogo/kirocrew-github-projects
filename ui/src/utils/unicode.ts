/**
 * Utility function to unescape raw unicode escape sequences (e.g. \u00e7 -> ç)
 * often returned by JSON APIs or CLI GraphQL outputs.
 */
export function decodeUnicodeEscapes(str: string | undefined | null): string {
  if (!str) return ''
  try {
    return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16))
    })
  } catch {
    return str
  }
}
