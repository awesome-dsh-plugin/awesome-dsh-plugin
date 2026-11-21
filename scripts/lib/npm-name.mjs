/** Resolve the Dots classic listing separately from the MCP subpackage in one GitHub repo. */
const classicListing = 'tests4gptplay/dsh-dots'

export function publishedNpmName(entryPath, declaredName) {
  // The classic market row points at the repo root, which now hosts Dot MCP on main.
  // Its published distribution remains @tests4gptplay/dsh-dots@1.0.12.
  if (entryPath.toLowerCase() === classicListing && (declaredName === 'dsh-dots' || declaredName === 'dsh-dot-mcp')) {
    return '@tests4gptplay/dsh-dots'
  }
  // The new subpackage URL resolves to dsh-dot-mcp@1.0.0 via its own manifest.
  return declaredName
}
