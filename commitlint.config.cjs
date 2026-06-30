/**
 * Conventional Commits, enforced on every commit message via the Husky
 * `commit-msg` hook and in CI on pull requests.
 * https://www.conventionalcommits.org/
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
};
