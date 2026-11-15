# artifact-deploy

Deploy selected artifact files to a GitHub repository, then commit and push the resulting change.

## Quick start

~~~yaml
name: Deploy artifacts

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v7

      - name: Build
        run: npm run build

      - name: Deploy artifact
        uses: yukiakai212/artifact-deploy@v6
        with:
          source-directory: .
          source-patterns: |
            dist/**
          target-repository: your-account/your-artifact-repository
          target-directory: .
          branch: main
          token: ${{ secrets.GH_PAT }}
          replace-target-directory: true
          commit-message: "deploy: update artifacts"
~~~

## Inputs

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| <code>source-directory</code> | no | <code>.</code> | Artifact source root, relative to <code>GITHUB_WORKSPACE</code>. |
| <code>source-patterns</code> | yes | - | Newline-delimited glob patterns selecting source files. |
| <code>target-repository</code> | yes | - | GitHub.com repository reference (<code>owner/repository</code>) or GitHub URL that receives the artifact. |
| <code>target-directory</code> | no | <code>.</code> | Destination directory inside the target repository. |
| <code>branch</code> | yes | - | Target repository branch to prepare and push. |
| <code>token</code> | yes | - | Token with write access to the target repository. |
| <code>replace-target-directory</code> | no | <code>true</code> | Delete existing destination content before copying the artifact. |
| <code>commit-message</code> | no | <code>deploy: update artifacts</code> | Commit message used when the deployment changes the target repository. |

## Path behavior

Patterns are resolved from <code>source-directory</code>, and that directory is not included in the destination path.

~~~yaml
source-directory: packages/site
source-patterns: |
  dist/**
target-directory: web
~~~

For example, <code>packages/site/dist/index.html</code> is deployed as
<code>web/dist/index.html</code> in the target repository.

## Replacement behavior

By default, <code>replace-target-directory</code> is <code>true</code>. The action removes the existing contents of <code>target-directory</code>, then copies the selected artifact files into it. Use this when the destination is owned entirely by the deployment.

Set it to <code>false</code> to overlay selected files and leave existing, unselected files in place:

~~~yaml
replace-target-directory: false
~~~

Be especially deliberate when <code>target-directory</code> is <code>.</code>: replacement then applies to the target repository root.

## Safety and failure behavior

- The action resolves source and target paths inside their respective workspace or repository roots.
- <code>.git</code> is always ignored while collecting source files.
- A matched symbolic link causes the deployment to fail.
- If the patterns select no deployable files, the deployment fails before the target repository is prepared or changed.
- If copying produces no Git changes, the action does not create an empty commit.

## Authentication

Use a token that can write to <code>target-repository</code>:

~~~yaml
token: ${{ secrets.GH_PAT }}
~~~

When deploying to a different repository, the workflow <code>GITHUB_TOKEN</code> usually cannot write there. A fine-grained personal access token or GitHub App token with repository contents write access is appropriate.

## Concurrency

Serialize deployments that write to the same target branch so two runs cannot overwrite each other:

~~~yaml
concurrency:
  group: deploy-artifact-${{ github.repository }}-main
  cancel-in-progress: false
~~~

## License

MIT (c) Yuki Akai
