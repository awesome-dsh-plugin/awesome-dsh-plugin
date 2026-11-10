/** Resolve a published npm identity where it differs from the source bundle name. */
const publishedNameOverrides = new Map([
  ['tests4gptplay/dsh-dots', { declared: 'dsh-dots', published: '@tests4gptplay/dsh-dots' }],
])

export function publishedNpmName(repo, declaredName) {
  const override = publishedNameOverrides.get(repo.toLowerCase())
  return override?.declared === declaredName ? override.published : declaredName
}
