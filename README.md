# artifact-deploy

> Deploy selected files (artifacts) to another GitHub repository — clean, simple, and reliable.

---

## ✨ Features

* 📦 Deploy only specific files using glob patterns
* 🧹 Clean target repository before each deploy
* 🧠 Monorepo-friendly with `base-dir`
* 📜 Preserve git history (no force push by default)
* 🚀 Fast with shallow clone
* 🛠 Custom commit message support

---

## 🚀 Use Case

* Publish `dist/` without exposing source code
* Deploy build artifacts to a separate repo
* Maintain a clean artifact repository
* CI/CD pipelines for static assets or docs

---

## 📦 Usage

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: npm run build

      - name: Deploy artifacts
        uses: your-username/artifact-deploy@v1
        with:
          repo: your-username/target-repo
          token: ${{ secrets.GH_PAT }}
          base-dir: ./packages/abc
          files: |
            dist/**
          commit-message: |
            deploy: build artifacts

            source: ${{ github.repository }}@${{ github.sha }}
```

---

## ⚙️ Inputs

| Name             | Required | Default                    | Description                         |
| ---------------- | -------- | -------------------------- | ----------------------------------- |
| `repo`           | ✅        | —                          | Target repository (`user/repo`)     |
| `branch`         | ❌        | `main`                     | Target branch                       |
| `token`          | ✅        | —                          | GitHub token (PAT recommended)      |
| `base-dir`       | ❌        | `.`                        | Base directory for resolving files  |
| `files`          | ✅        | —                          | Glob patterns (multiline supported) |
| `commit-message` | ❌        | `deploy: update artifacts` | Commit message                      |

---

## 🧠 How It Works

1. Clone target repository (shallow)
2. Remove all tracked files (`git rm -rf .`)
3. Copy matched files into repo
4. Commit changes (if any)
5. Push to target branch

---

## 📁 Path Behavior (Monorepo Friendly)

```yaml
base-dir: ./packages/app
files: |
  dist/**
```

This will copy:

```
./packages/app/dist/index.js
```

Into target repo as:

```
dist/index.js
```

> `base-dir` is stripped automatically.

---

## ⚠️ Notes

* `.git` directory is preserved to keep commit history
* If no files change, no commit will be created
* Target repo will always reflect the latest snapshot

---

## 🔐 Authentication

Use a Personal Access Token (PAT):

```yaml
token: ${{ secrets.GH_PAT }}
```

Make sure it has `repo` permissions.

---

## 💡 Best Practices

### Use meaningful commit messages

```yaml
commit-message: |
  deploy: web build

  source: ${{ github.repository }}@${{ github.sha }}
```

### Keep artifact repo separate

* Avoid mixing source and build output
* Keep repo lightweight and clean

---

## 📜 License

MIT
