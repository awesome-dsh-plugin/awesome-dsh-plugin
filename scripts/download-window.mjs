// Use explicit UTC dates: relative npm endpoints can return an old cached window.
export function downloadWindow(now = new Date()) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 86400000)
  const start = new Date(end.getTime() - 29 * 86400000)
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}

export function downloadResult(body, name, window, checkedAt) {
  // A one-package unscoped batch uses the same shape as a scoped request.
  const row = body?.package === name ? body : body?.[name]
  if (!row || row.package !== name || row.start !== window.start || row.end !== window.end
      || !Number.isSafeInteger(row.downloads) || row.downloads < 0) {
    throw new Error('Missing, invalid, or stale npm download response')
  }
  return { downloads: row.downloads, checkedAt, start: row.start, end: row.end }
}
