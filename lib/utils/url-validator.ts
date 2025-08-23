export function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch (_) {
    return false
  }
}

export function normalizeUrl(url: string): string {
  // Add https:// if no protocol is specified
  if (!url.match(/^https?:\/\//)) {
    url = "https://" + url
  }
  return url
}
