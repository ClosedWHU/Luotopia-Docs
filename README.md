# new-whu-sb 文档

本目录收录 new-whu-sb 项目相关的开发者文档索引，包含后端构建、打包与部署指南（适用于本地、容器与云平台）。

- `backend-build-and-deploy.md`：后端（Go 服务）各平台构建与部署指南。

如果你希望将文档放在仓库的其他位置（例如 `server/docs` 或单独的 wiki），请告知。文档会同时提交到 `server/docs` 以便纳入版本控制（如需要，可移除重复）。
# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
