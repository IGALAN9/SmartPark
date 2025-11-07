import express from "express";
import next from "next";
import dotenv from "dotenv";
import usersRouter from "./routes/users.js";
import mallsRouter from "./routes/malls.js";
import parkingLotsRouter from "./routes/parkingLots.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./db.js";
import { User } from "../Models/User.js";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.join(__dirname, "../../Frontend");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, dir: frontendDir }); 
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

app.prepare().then(async () => {
  await connectDB();

  const server = express();
  server.use(express.json());
  server.use(cookieParser());
  server.use("/api/users", usersRouter);
  server.use("/api/malls", mallsRouter);
  server.use("/api/parking-lots", parkingLotsRouter);

  // === API Routes ===
  server.get("/api/users", async (req, res) => {
    try {
      const users = await User.find().lean();
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // === Handle all other routes with Next ===
  server.use((req, res) => handle(req, res));

  server.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
  });
});
