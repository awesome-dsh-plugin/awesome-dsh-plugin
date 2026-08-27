/**
 * Comment provider configuration.
 *
 * Giscus stores comments in GitHub Discussions. The IDs below are public
 * identifiers, not secrets, but they cannot be guessed: an administrator of
 * awesome-dsh-plugin/awesome-dsh-plugin must first enable Discussions, create
 * the category, and install the Giscus GitHub App at https://giscus.app.
 *
 * Leave enabled false until those two IDs are copied from the configurator.
 * Keeping the feature off is intentional: an incomplete widget must not ship
 * a broken third-party request to every visitor.
 */
export default Object.freeze({
  enabled: false,
  repo: 'awesome-dsh-plugin/awesome-dsh-plugin',
  repoId: '',
  category: 'Plugin comments',
  categoryId: '',
})
