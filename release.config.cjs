// release.config.cjs
module.exports = {
  branches: ["main", { name: "next", prerelease: true }],

  // Debug mode
  debug: process.env.CI ? false : true,

  plugins: [
    // 1. Analyze commits to determine release type
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: [
          // Documentation changes
          { type: "docs", release: "patch" },
          { type: "doc", release: "patch" },

          // Code improvements
          { type: "refactor", release: "patch" },
          { type: "perf", release: "patch" },

          // Features and fixes (default behavior)
          { type: "feat", release: "minor" },
          { type: "fix", release: "patch" },

          // Breaking changes
          { breaking: true, release: "major" },

          // No release for these
          { type: "style", release: false },
          { type: "chore", release: false },
          { type: "test", release: false },
          { type: "ci", release: false },
          { type: "build", release: false },
        ],
        parserOpts: {
          noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"],
        },
      },
    ],

    // 2. Generate release notes
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "angular",
        writerOpts: {
          commitsSort: ["subject", "scope"],
        },
      },
    ],

    // 3. Update CHANGELOG.md
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],

    // 4. Update package.json and publish to NPM
    [
      "@semantic-release/npm",
      {
        npmPublish: true,
        tarballDir: "dist",
      },
    ],

    // 5. Create GitHub release
    [
      "@semantic-release/github",
      {
        assets: [
          {
            path: "dist/*.tgz",
            label: "Package tarball",
          },
        ],
      },
    ],

    // 6. Commit updated files (must be last)
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json", "package-lock.json"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],
};
