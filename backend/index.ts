import dotenv from "dotenv";
dotenv.config(); // ✅ Load .env before anything else

import express, { type Request, type Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

// Routes
import ticketsRouter from "./routes/tickets.js";
import eventRoutes from "./routes/events.js";
import analyticsRoutes from "./routes/analytics.js";
import eventAnalyticsRoutes from "./routes/eventAnalytics.js";
import eventExportRoutes from "./routes/eventExports.js";
import authRoutes from "./routes/authRouter.js";
import permissionsRoutes from "./routes/permissions.js";
import imagesRoutes from "./routes/images.js";
import userRoleRoutes from "./routes/userRole.js";
import organizerRequestsRouter from "./routes/organizerRequests.js";
import type { ApiResponse } from "./types/index.js";
import chatRoute from "./routes/chat.js"; // ✅ Chatbot route

// Initialize Express app
const app = express();

// Resolve current file path (for serving frontend later)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Confirm your OpenAI key is loaded
console.log("✅ Loaded OpenAI Key:", process.env.OPENAI_API_KEY ? "Yes" : "No");

// ========================
// 🔧 Middleware
// ========================
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://yourdomain.com", "https://www.yourdomain.com"]
      : ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// 🚀 Routes
// ========================
app.use("/tickets", ticketsRouter);
app.use("/api", chatRoute); // ✅ Chatbot endpoint -> http://localhost:3002/api/chatbot

app.use("/events", eventRoutes);
app.use("/events", eventAnalyticsRoutes);
app.use("/events", eventExportRoutes);
app.use("/events/analytics", analyticsRoutes);
app.use("/auth", authRoutes);
app.use("/permissions", permissionsRoutes);
app.use("/images", imagesRoutes);
app.use("/userRole", userRoleRoutes);
app.use("/organizer-requests", organizerRequestsRouter);

// Dev test route
if (process.env.NODE_ENV !== "production") {
  app.get("/", (req: Request, res: Response) => {
    res.send("Hello world! API running in development mode.");
  });
}

// ========================
// ⚙️ Serve frontend build (only in production)
// ========================
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/build")));

  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../frontend/build/index.html"));
  });
}

// ========================
// ⚠️ Error handling
// ========================
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error("❌ Error stack:", err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
  } as ApiResponse);
});

// 404 handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  } as ApiResponse);
});

// ========================
// 🟢 Start server
// ========================
const port = parseInt(process.env.PORT || "3002");
app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});
