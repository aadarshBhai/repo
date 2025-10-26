import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import submissionsRoutes from "./routes/submissions.js";
import uploadsRoutes from "./routes/uploads.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env"), override: true });

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== API Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/uploads", uploadsRoutes);

// ===== Serve Uploaded Files =====
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== Serve Frontend (Vite build) =====
app.use(express.static(path.join(__dirname, "../dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

// ===== Connect to MongoDB =====
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error(
    "❌ MONGODB_URI is not set. Make sure backend/.env contains MONGODB_URI and dotenv is loading it."
  );
  process.exit(1);
}

// Mask password in log
try {
  const masked = mongoUri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
  console.log("Attempting MongoDB connection with URI:", masked);
} catch (_) {}

mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
