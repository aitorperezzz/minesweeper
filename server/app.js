// This file implements the server code for the game.

import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ===== Resolve __dirname =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ===== Express server =====
const app = express();

// Serve static files from ../client
app.use(express.static(path.join(__dirname, "../client")));

// Serve p5.js from ../node_modules/p5/lib
app.use("/lib", express.static(path.join(__dirname, "../node_modules/p5/lib")));

// Start server
const PORT = 8080;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
