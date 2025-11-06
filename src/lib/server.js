import express from "express";
import next from "next";
import dotenv from "dotenv";
import usersRouter from "./routes/users.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./db.js";
import { User } from "../Models/User.js";

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

app.prepare().then(async () => {
  await connectDB();

  const server = express();
  server.use(express.json());
  server.use(cookieParser());
  server.use("/api/users", usersRouter);

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
