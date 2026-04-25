# Minesweeper

A small Minesweeper game served with Express and rendered in the browser with p5.js.

## Run Locally

Install dependencies:

```sh
npm install
```

Start the server:

```sh
npm start
```

Open the app at:

```text
http://localhost:8080
```

## Run With Docker

Build the image:

```sh
docker build -t minesweeper .
```

Run the container:

```sh
docker run --rm -p 8080:8080 minesweeper
```

Open the app at:

```text
http://localhost:8080
```

## Run With Docker Compose

Start the service:

```sh
docker compose up --build
```

To run it in the background:

```sh
docker compose up --build -d
```

Stop the service:

```sh
docker compose down
```

## Controls

- Tap/click a cell to reveal it.
- Press `Flag` and then tap/click a cell to mark or unmark it.
- Right click a cell to mark or unmark it.
- Press `F` to toggle the next flag action.
