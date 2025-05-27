// release.config.cjs
module.exports = {
  branches: ["main", { name: "next", prerelease: true }],
  plugins: [
    // 1. Analyze commits to determine release type
    "@semantic-release/commit-analyzer",

    // 2. Generate release notes from commits
    "@semantic-release/release-notes-generator",

    // 3. Update CHANGELOG.md file
    "@semantic-release/changelog",

    // 4. Update package.json version and publish to NPM
    "@semantic-release/npm",

    // 5. Create Git tag and GitHub release with notes
    "@semantic-release/github",

    // 6. Commit updated files (package.json, CHANGELOG.md)
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],

  // Commit message rules (conventional commits)
  preset: "angular",

  // Custom release rules
  releaseRules: [
    { type: "docs", scope: "README", release: "patch" },
    { type: "refactor", release: "patch" },
    { type: "perf", release: "patch" },
    { type: "style", release: false },
    { type: "chore", release: false },
    { type: "test", release: false },
    { type: "ci", release: false },
  ],

  // Configure release notes generation
  generateNotes: {
    preset: "angular",
    writerOpts: {
      commitsSort: ["subject", "scope"],
    },
  },
};
