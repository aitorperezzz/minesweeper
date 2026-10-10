# Minesweeper

A small Minesweeper game served with Express and rendered in the browser with p5.js.

## How it works

Reveal every cell without a mine to win. Numbers show how many mines are in
neighboring cells; use them to decide which cells are safe.

- Tap/click a cell to reveal it.
- Press `Flag` and then tap/click a cell to mark or unmark it.
- Right-click a cell to mark or unmark it.
- Press `F` to toggle the next flag action.

## Docker Compose

Copy or download [docker-compose.yml](docker-compose.yml) into a directory.
It uses the published image `ghcr.io/aitorperezzz/minesweeper:latest`.
From that directory, start the app or update it to the latest published image:

```sh
docker compose up -d --pull always
```

Open <http://localhost:8080>. Change the left side of `8080:8080` to use a
different host port. You only need the Compose file; cloning the repository
is optional.

Stop the app with `docker compose down`.

## Run locally

With Node.js 22 and npm installed, clone the repository and run:

```sh
npm ci
npm start
```

Open <http://localhost:8080>.

## GitLab CI/CD

Every branch push builds with Buildah and publishes the commit SHA and `latest`
to the local GitLab registry. Only pushes to the default branch (`main` or
`master`) also publish `ghcr.io/aitorperezzz/minesweeper:latest`. Tag pushes and
merge request pipelines do not publish images.

Set `GHCR_TOKEN` as a masked and hidden GitLab CI/CD variable, with expansion
disabled, using a GitHub classic token with `write:packages`. If the variable
is protected, protect the default branch too. After the first publication,
set the GitHub package to **Public** to allow pulls without authentication.
