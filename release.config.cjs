// release.config.cjs
module.exports = {
  branches: [
    "main",
    { name: "next", prerelease: true },
    { name: "develop", prerelease: "beta" },
  ],

  // Debug mode فقط در محیط local
  debug: !process.env.CI,

  plugins: [
    // 1. تحلیل commit ها
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: [
          // Features and fixes
          { type: "feat", release: "minor" },
          { type: "feature", release: "minor" },
          { type: "fix", release: "patch" },
          { type: "bugfix", release: "patch" },

          // Documentation and improvements
          { type: "docs", release: "patch" },
          { type: "doc", release: "patch" },
          { type: "refactor", release: "patch" },
          { type: "perf", release: "patch" },
          { type: "style", release: "patch" },

          // Security and dependencies
          { type: "security", release: "patch" },
          { type: "deps", release: "patch" },
          { type: "dep", release: "patch" },

          // Breaking changes
          { breaking: true, release: "major" },

          // No release for these
          { type: "chore", release: false },
          { type: "test", release: false },
          { type: "ci", release: false },
          { type: "build", release: false },
          { type: "revert", release: false },
        ],
        parserOpts: {
          noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"],
          headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/,
          headerCorrespondence: ["type", "scope", "subject"],
        },
      },
    ],

    // 2. تولید release notes
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "angular",
        writerOpts: {
          commitsSort: ["subject", "scope"],
        },
      },
    ],

    // 3. به‌روزرسانی CHANGELOG.md
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
        changelogTitle:
          "# 📝 Changelog\n\nAll notable changes to this project will be documented in this file.",
      },
    ],

    // 4. به‌روزرسانی package.json و انتشار در NPM
    [
      "@semantic-release/npm",
      {
        npmPublish: true,
        tarballDir: "dist",
      },
    ],

    // 5. ایجاد GitHub release
    [
      "@semantic-release/github",
      {
        assets: [
          {
            path: "dist/*.tgz",
            label: "Package tarball",
          },
          {
            path: "CHANGELOG.md",
            label: "Changelog",
          },
        ],
        successComment:
          "🎉 This issue has been resolved in version ${nextRelease.version}",
        labels: ["released"],
      },
    ],

    // 6. Commit فایل‌های به‌روزرسانی شده (باید آخرین باشد)
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json", "package-lock.json"],
        message:
          "chore(release): 🚀 ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],

  // تنظیمات اضافی
  repositoryUrl: "https://github.com/mostafarastegar/react-constore.git",
  tagFormat: "v${version}",
};
