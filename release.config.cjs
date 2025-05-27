// release.config.cjs
module.exports = {
  branches: [
    "main",
    { name: "next", prerelease: true },
    { name: "develop", prerelease: "beta" } // اگر میخواهید develop هم release داشته باشد
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
          // Documentation changes
          { type: "docs", release: "patch" },
          { type: "doc", release: "patch" },

          // Code improvements
          { type: "refactor", release: "patch" },
          { type: "perf", release: "patch" },
          { type: "style", release: "patch" }, // CSS/UI changes

          // Features and fixes
          { type: "feat", release: "minor" },
          { type: "feature", release: "minor" },
          { type: "fix", release: "patch" },
          { type: "bugfix", release: "patch" },

          // Breaking changes
          { breaking: true, release: "major" },

          // Security fixes
          { type: "security", release: "patch" },

          // Dependencies
          { type: "deps", release: "patch" },
          { type: "dep", release: "patch" },

          // No release for these
          { type: "chore", release: false },
          { type: "test", release: false },
          { type: "ci", release: false },
          { type: "build", release: false },
          { type: "revert", release: false },
        ],
        parserOpts: {
          noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"],
          // Patterns برای شناسایی commit types
          headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/,
          headerCorrespondence: ["type", "scope", "subject"],
          // مثال‌های معتبر:
          // feat: add new feature
          // fix: resolve bug
          // feat(auth): add login functionality
          // fix(ui): correct button styling
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
          // سفارشی سازی sections
          transform: (commit, context) => {
            const issues = [];

            commit.notes.forEach(note => {
              note.title = "BREAKING CHANGES";
            });

            if (commit.type === "feat" || commit.type === "feature") {
              commit.type = "✨ Features";
            } else if (commit.type === "fix" || commit.type === "bugfix") {
              commit.type = "🐛 Bug Fixes";
            } else if (commit.type === "perf") {
              commit.type = "⚡ Performance";
            } else if (commit.type === "revert") {
              commit.type = "⏪ Reverts";
            } else if (commit.type === "docs" || commit.type === "doc") {
              commit.type = "📚 Documentation";
            } else if (commit.type === "style") {
              commit.type = "💄 Styles";
            } else if (commit.type === "refactor") {
              commit.type = "♻️ Code Refactoring";
            } else if (commit.type === "test") {
              commit.type = "✅ Tests";
            } else if (commit.type === "build") {
              commit.type = "🔧 Build System";
            } else if (commit.type === "ci") {
              commit.type = "👷 CI";
            } else if (commit.type === "chore") {
              return;
            } else {
              return;
            }

            if (typeof commit.hash === "string") {
              commit.shortHash = commit.hash.substring(0, 7);
            }

            if (typeof commit.subject === "string") {
              let url = context.repository
                ? `${context.host}/${context.owner}/${context.repository}`
                : context.repoUrl;
              if (url) {
                url = `${url}/issues/`;
                // Issue references
                commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
                  issues.push(issue);
                  return `[#${issue}](${url}${issue})`;
                });
              }
              if (context.host) {
                // User references
                commit.subject = commit.subject.replace(/\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g, (_, username) => {
                  if (username.includes("/")) {
                    return `@${username}`;
                  }

                  return `[@${username}](${context.host}/${username})`;
                });
              }
            }

            // remove references that already appear in the subject
            commit.references = commit.references.filter(reference => {
              if (issues.indexOf(reference.issue) === -1) {
                return true;
              }

              return false;
            });

            return commit;
          },
        },
      },
    ],

    // 3. به‌روزرسانی CHANGELOG.md
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
        changelogTitle: "# 📝 Changelog\n\nAll notable changes to this project will be documented in this file.",
      },
    ],

    // 4. به‌روزرسانی package.json و انتشار در NPM
    [
      "@semantic-release/npm",
      {
        npmPublish: true,
        tarballDir: "dist",
        // اطمینان از build قبل از publish
        prepublishOnly: false,
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
        // سفارشی سازی عنوان و توضیحات release
        successComment: "🎉 This ${issue.pull_request ? 'PR is included' : 'issue has been resolved'} in version ${nextRelease.version}",
        labels: ["released"],
        releasedLabels: ["released<%= nextRelease.channel ? ` on @${nextRelease.channel}` : "" %> from <%= nextRelease.gitTag %>"],
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

  // تنظیمات اضافی برای troubleshooting
  repositoryUrl: "https://github.com/mostafarastegar/react-constore.git",
  tagFormat: "v${version}",
};