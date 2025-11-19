import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "../routes/auth.js";
import jobRoutes from "../routes/jobs.js";
import adminroutes from "../routes/admin.js";
import candidateRoutes from "../routes/candidate.js";
import hrRoutes from "../routes/hrRoutes.js";



const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // React frontend
  credentials: true
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/admin", adminroutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/hr", hrRoutes)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));



// Test route
app.get("/", (req, res) => res.send("Backend is working!"));

// Connect to MongoDB & start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() =>
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    )
  )
  .catch((err) => console.error("MongoDB connection error:", err));
